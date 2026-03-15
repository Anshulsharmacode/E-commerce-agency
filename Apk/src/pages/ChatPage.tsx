import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import {
  BASE_URL,
  getConversationMessages,
  getMyConversations,
  getProfile,
  sendChatMessage,
  type ChatConversation,
  type ChatMessage,
  type SendChatMessageResult,
} from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, SendHorizontal, Wifi, WifiOff } from 'lucide-react';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

type SocketAck<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

const sortConversations = (
  conversations: ChatConversation[],
): ChatConversation[] => {
  return [...conversations].sort((a, b) => {
    const aTime = new Date(a.last_message_at ?? a.updated_at).getTime();
    const bTime = new Date(b.last_message_at ?? b.updated_at).getTime();
    return bTime - aTime;
  });
};

const upsertConversation = (
  current: ChatConversation[],
  next: ChatConversation,
): ChatConversation[] => {
  const exists = current.some(
    (conversation) => conversation.conversation_id === next.conversation_id,
  );

  if (!exists) {
    return [...current, next];
  }

  return current.map((conversation) =>
    conversation.conversation_id === next.conversation_id ? next : conversation,
  );
};

const getConversationTitle = (
  conversation: ChatConversation | undefined,
  myUserId: string,
): string => {
  if (!conversation) {
    return 'Support Chat';
  }

  const otherParticipant = conversation.participant_profiles.find(
    (profile) => profile._id !== myUserId,
  );

  if (otherParticipant?.name) {
    return otherParticipant.name;
  }

  const adminParticipant = conversation.participant_profiles.find(
    (profile) => profile.role === 'admin',
  );

  return adminParticipant?.name ?? 'Support Chat';
};

const getErrorMessage = (error: unknown): string => {
  const apiErr = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    apiErr.response?.data?.message ??
    apiErr.message ??
    'Something went wrong while loading chat.'
  );
};

function ChatPage() {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);

  const [myUserId, setMyUserId] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const loadInitialData = async () => {
      setIsLoadingConversations(true);
      setError('');

      try {
        const [profileResponse, conversationResponse] = await Promise.all([
          getProfile(),
          getMyConversations(),
        ]);

        setMyUserId(profileResponse.data._id);
        const sortedConversations = sortConversations(conversationResponse.data);
        setConversations(sortedConversations);

        if (sortedConversations.length > 0) {
          setActiveConversationId((previous) =>
            previous ?? sortedConversations[0].conversation_id,
          );
        }
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoadingConversations(false);
      }
    };

    void loadInitialData();
  }, [navigate]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      setError('');
      try {
        const response = await getConversationMessages(activeConversationId, 50, 1);
        setMessages(response.data);
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoadingMessages(false);
      }
    };

    void loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const socket = io(`${BASE_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    setConnectionStatus('connecting');

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit(
        'conversation:list',
        (response: SocketAck<ChatConversation[]>) => {
          if (!response?.ok || !response.data) {
            return;
          }

          setConversations((previous) => {
            const merged = [...previous];
            for (const conversation of response.data ?? []) {
              const updated = upsertConversation(merged, conversation);
              merged.splice(0, merged.length, ...updated);
            }
            return sortConversations(merged);
          });
        },
      );
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on(
      'conversation:updated',
      (payload: { conversation?: ChatConversation }) => {
        if (!payload.conversation) {
          return;
        }

        setConversations((previous) =>
          sortConversations(upsertConversation(previous, payload.conversation!)),
        );
        setActiveConversationId(
          (previous) => previous ?? payload.conversation!.conversation_id,
        );
      },
    );

    socket.on('message:new', (payload: { message?: ChatMessage }) => {
      if (!payload.message) {
        return;
      }

      if (payload.message.conversation_id !== activeConversationIdRef.current) {
        return;
      }

      setMessages((previous) => {
        if (
          previous.some((message) => message.message_id === payload.message?.message_id)
        ) {
          return previous;
        }

        return [...previous, payload.message!];
      });
    });

    socket.on('connect_error', (connectError: Error) => {
      setConnectionStatus('disconnected');
      setError(connectError.message || 'Unable to connect to chat server.');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].conversation_id);
    }
  }, [activeConversationId, conversations]);

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.conversation_id === activeConversationId,
      ),
    [activeConversationId, conversations],
  );

  const chatTitle = useMemo(
    () => getConversationTitle(activeConversation, myUserId),
    [activeConversation, myUserId],
  );

  const applySendResult = (result: SendChatMessageResult) => {
    setConversations((previous) =>
      sortConversations(upsertConversation(previous, result.conversation)),
    );

    setActiveConversationId(
      (previous) => previous ?? result.conversation.conversation_id,
    );

    const activeId = activeConversationIdRef.current ?? result.conversation.conversation_id;
    if (activeId !== result.conversation.conversation_id) {
      return;
    }

    setMessages((previous) => {
      if (previous.some((message) => message.message_id === result.message.message_id)) {
        return previous;
      }

      return [...previous, result.message];
    });
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) {
      return;
    }

    setDraft('');
    setError('');
    setIsSending(true);

    const payload = activeConversationId
      ? { conversation_id: activeConversationId, content }
      : { content };

    const socket = socketRef.current;

    if (socket?.connected) {
      socket.emit(
        'message:send',
        payload,
        (response: SocketAck<SendChatMessageResult>) => {
          if (response?.ok && response.data) {
            applySendResult(response.data);
          } else {
            setError(response?.message ?? 'Unable to send message.');
            setDraft(content);
          }
          setIsSending(false);
        },
      );
      return;
    }

    try {
      const response = await sendChatMessage(payload);
      applySendResult(response.data);
    } catch (sendError: unknown) {
      setError(getErrorMessage(sendError));
      setDraft(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground">{chatTitle}</h1>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                  Real-time connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-destructive" />
                  Reconnecting...
                </>
              )}
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {conversations.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {conversations.map((conversation) => {
            const isActive = conversation.conversation_id === activeConversationId;
            return (
              <button
                key={conversation.conversation_id}
                type="button"
                onClick={() => setActiveConversationId(conversation.conversation_id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground'
                }`}
              >
                {getConversationTitle(conversation, myUserId)}
              </button>
            );
          })}
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {(isLoadingConversations || isLoadingMessages) && (
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        )}

        {!isLoadingConversations && !isLoadingMessages && messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
            Start your conversation. Your message will be delivered to admin in
            real time.
          </div>
        )}

        <div className="space-y-3">
          {messages.map((message) => {
            const isMine = message.sender_id === myUserId;

            return (
              <div
                key={message.message_id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMine
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <form
        onSubmit={handleSendMessage}
        className="sticky bottom-16 border-t border-border bg-card px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            className="h-11 rounded-xl"
          />
          <Button
            type="submit"
            disabled={isSending || draft.trim().length === 0}
            className="h-11 rounded-xl px-4"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ChatPage;
