export const DEFAULT_PAGINATION_PAGE = 1;
export const DEFAULT_PAGINATION_LIMIT = 50;
export const MAX_PAGINATION_LIMIT = 50;

export const template = `
    <div style="font-family: Arial;">
      <h2>Your OTP Code</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 5px;">{{otp}}</h1>
      <p>This expires in 5 minutes.</p>
    </div>
  `;
