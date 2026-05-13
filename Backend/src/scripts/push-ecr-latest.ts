import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import * as dotenv from 'dotenv';
import {
  CreateRepositoryCommand,
  DescribeRepositoriesCommand,
  ECRClient,
  GetAuthorizationTokenCommand,
  RepositoryNotFoundException,
} from '@aws-sdk/client-ecr';

function runCommand(cmd: string, args: string[], input?: string) {
  const result = spawnSync(cmd, args, {
    stdio: input ? ['pipe', 'inherit', 'inherit'] : 'inherit',
    input,
    encoding: 'utf-8',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

function ensureEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

async function ensureRepository(client: ECRClient, repositoryName: string) {
  try {
    await client.send(
      new DescribeRepositoriesCommand({ repositoryNames: [repositoryName] }),
    );
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundException) {
      await client.send(new CreateRepositoryCommand({ repositoryName }));
      return;
    }
    throw error;
  }
}

async function getEcrLogin(client: ECRClient) {
  const auth = await client.send(new GetAuthorizationTokenCommand({}));
  const authData = auth.authorizationData?.[0];

  if (!authData?.authorizationToken || !authData.proxyEndpoint) {
    throw new Error('Could not fetch ECR authorization token');
  }

  const decoded = Buffer.from(authData.authorizationToken, 'base64').toString(
    'utf-8',
  );
  const [username, password] = decoded.split(':', 2);

  if (!username || !password) {
    throw new Error('Invalid ECR authorization token format');
  }

  return {
    username,
    password,
    proxyEndpoint: authData.proxyEndpoint.replace(/^https?:\/\//, ''),
  };
}

async function main() {
  dotenv.config();

  const awsRegion = process.env.AWS_REGION?.trim() || 'ap-south-1';
  const repository = ensureEnv('ECR_REPOSITORY');
  const imageTag = process.env.IMAGE_TAG?.trim() || 'latest';
  const localImage = `${repository}:${imageTag}`;

  const backendDir = process.cwd();
  const dockerfilePath = `${backendDir}/Dockerfile`;

  const ecr = new ECRClient({ region: awsRegion });

  console.log(`AWS Region: ${awsRegion}`);
  console.log(`ECR Repository: ${repository}`);
  console.log(`Image Tag: ${imageTag}`);

  await ensureRepository(ecr, repository);
  const login = await getEcrLogin(ecr);
  const ecrImage = `${login.proxyEndpoint}/${repository}:${imageTag}`;

  console.log(`Logging in to ECR registry: ${login.proxyEndpoint}`);
  runCommand(
    'docker',
    ['login', '--username', login.username, '--password-stdin', login.proxyEndpoint],
    login.password,
  );

  console.log(`Building Docker image: ${localImage}`);
  runCommand('docker', ['build', '-t', localImage, '-f', dockerfilePath, backendDir]);

  console.log(`Tagging image: ${ecrImage}`);
  runCommand('docker', ['tag', localImage, ecrImage]);

  console.log(`Pushing image: ${ecrImage}`);
  runCommand('docker', ['push', ecrImage]);

  console.log(`Done. Pushed ${ecrImage}`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('Could not load credentials from any providers')) {
    console.error('ECR push failed: AWS credentials were not found.');
    console.error(
      'Set credentials via Backend/.env or shell env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and optional AWS_SESSION_TOKEN.',
    );
    console.error(
      'Then rerun: AWS_REGION=ap-south-1 ECR_REPOSITORY=ecom-backend npm run push:ecr:latest',
    );
    process.exit(1);
  }
  console.error(`ECR push failed: ${message}`);
  process.exit(1);
});
