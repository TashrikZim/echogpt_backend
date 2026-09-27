import { PrismaClient, ProviderType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Default Admin User
  const adminEmail = 'admin@echogpt.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Admin@123456', saltRounds);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'EchoGPT System Administrator',
        passwordHash,
        role: Role.ADMIN,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: admin.id,
        plan: 'PREMIUM',
        dailyRequestLimit: 500,
      },
    });

    console.log(`[Seed] Created Admin user: ${adminEmail} (Password: Admin@123456)`);
  } else {
    console.log(`[Seed] Admin user already exists.`);
  }

  // 2. Seed Default AI Providers (OpenAI, Claude, Gemini)
  const defaultProviders = [
    {
      name: 'OpenAI GPT-4o',
      type: ProviderType.OPENAI,
      apiKey: 'sk-proj-demo-openai-key-echogpt-default',
      baseUrl: 'https://api.openai.com/v1',
      modelIdentifier: 'gpt-4o',
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Claude 3.5 Sonnet',
      type: ProviderType.CLAUDE,
      apiKey: 'sk-ant-demo-claude-key-echogpt-default',
      baseUrl: 'https://api.anthropic.com/v1',
      modelIdentifier: 'claude-3-5-sonnet-20241022',
      isActive: true,
      isDefault: false,
    },
    {
      name: 'Google Gemini 1.5 Pro',
      type: ProviderType.GEMINI,
      apiKey: 'AIzaSy-demo-gemini-key-echogpt-default',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      modelIdentifier: 'gemini-1.5-pro',
      isActive: true,
      isDefault: false,
    },
  ];

  for (const prov of defaultProviders) {
    const existing = await prisma.aiProvider.findFirst({
      where: { modelIdentifier: prov.modelIdentifier },
    });

    if (!existing) {
      await prisma.aiProvider.create({
        data: prov,
      });
      console.log(`[Seed] Provisioned Provider: ${prov.name}`);
    } else {
      console.log(`[Seed] Provider ${prov.name} already exists.`);
    }
  }

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });