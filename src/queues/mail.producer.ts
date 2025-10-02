import mailQueue from "./mail.queue.js";

export type MailJobData = {
  email: string;
  subject: string;
  html: string;
};

const addMailJob = async ({ email, subject, html }: MailJobData) => {
  return await mailQueue.add("sendMail", {
    email,
    subject,
    html,
  });
};

export default addMailJob;
