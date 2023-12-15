import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const conversation: string[] = [
  "1. Hey, long time no see! How have you been?",
  "2. I've been good, thanks. Just keeping busy. What about you?",
  "3. Same here, just trying to stay out of trouble. Did you hear about Tom's new job?",
  "4. Yeah, I heard. He's really excited about it. I think it's a great opportunity for him.",
  "5. Definitely. We should all get together and celebrate his success.",
  "6. That sounds like a plan. Let's organize something for next weekend.",
  "7. I'll check with everyone and let you know the details.",
  "8. Great, looking forward to it!",
  "9. By the way, have you heard from Sarah recently?",
  "10. Yes, she's doing well. She just got back from her trip.",
  "11. I should catch up with her soon.",
  "12. You definitely should. She'd love to hear from you.",
  "13. I'll give her a call this evening.",
  "14. Awesome. It's always good to stay connected with old friends.",
  "15. Absolutely, it's what keeps us grounded.",
  "16. Agreed. Alright, I'll talk to you soon.",
  "17. Take care!",

  "18. Hey, how's it going? I was thinking of throwing a party next weekend.",
  "19 .That sounds like a fantastic idea! Count me in.",
  "20. Great! I'll send out the invites and let you know the details.",
  "21. Looking forward to it. It's been a while since we had a good party.",
  "22. Absolutely, it'll be a blast. I'll make sure to invite everyone from our group.",
  "23. Sounds like a plan. Let's make it a night to remember!",

  "24. I had a really productive day at work today. How about you?",
  "25. I'm glad to hear that. My day was quite challenging, but I managed to overcome the obstacles.",
  "26. That's the spirit! Overcoming challenges only makes us stronger in the long run.",
  "27. I completely agree. It's all about the growth and learning that comes from facing difficulties.",
  "28. Speaking of growth, have you thought about pursuing further education or learning a new skill?",
  "29. Funny you should mention that. I've been considering taking up a course in data science. How about you?",
  "30. I've been thinking about learning a new programming language. It's always good to expand our skill set.",
  "31. Absolutely. Continuous learning keeps our minds sharp and opens up new opportunities.",
  "32. I couldn't agree more. It's important to stay curious and keep evolving.",
  "33. Well said. Let's continue to challenge ourselves and support each other's growth.",
  "34. Definitely. It's conversations like these that inspire and motivate me.",
  "35. Likewise. I'm grateful for our friendship and the meaningful discussions we have.",
  "36. As am I. Here's to many more thought-provoking conversations and shared experiences.",
];

async function main(): Promise<void> {
  const users: Prisma.UserCreateManyInput[] = [
    { email: "john@example.com" },
    { email: "melissa@example.com" },
    { email: "amelia@example.com" },
    { email: "lucas@example.com" },
    { email: "robert@example.com" },
  ];

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  const messagesCreation: Prisma.Prisma__MessageClient<Prisma.MessageUncheckedCreateInput>[] = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const senderEmail = users[i].email;
      const recipientEmail = users[j].email;

      for (let k = 0; k < conversation.length; k++) {
        const message = conversation[k];
        const sender = k % 2 === 0 ? senderEmail : recipientEmail;
        const recipient = k % 2 === 0 ? recipientEmail : senderEmail;

        // one day apart
        const date = new Date();
        date.setDate(date.getDate() - (conversation.length - k));

        messagesCreation.push(
          prisma.message.create({
            data: {
              content: message,
              createdAt: date,
              readAt: null,
              sender: {
                connect: { email: sender },
              },
              recipient: {
                connect: { email: recipient },
              },
            },
          }),
        );
      }

      break;
    }
  }

  await prisma.$transaction(messagesCreation);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
