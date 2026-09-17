export const registerVoter = async ({
  voterId,
  password,
  verificationMode,
}: VoterRegistrationRequest) => {
  // Check if voter ID already exists
  const existing = await prisma.voterRegistration.findUnique({
    where: { voterId },
  });

  if (existing) {
    throw new Error('Voter ID already registered');
  }

  // Hash the plain-text password before saving
  const hashedPassword = await hashPassword(password);

  // Create user account (status: PENDING)
  const user = await prisma.user.create({
    data: {
      email: `voter-${voterId}@e-elct.local`,
      name: voterId,
      passwordHash: hashedPassword,
      role: 'VOTER',
      status: 'PENDING',
    },
  });

  // Create voter registration
  const registration = await prisma.voterRegistration.create({
    data: {
      userId: user.id,
      voterId,
      verificationMode,
    },
    include: { user: true },
  });

  return registration;
};
