import mailQueue from "./mail.queue.js";

const addMailJob = async ({ email, subject, html }: any) => {
  await mailQueue.add("sendMail", {
    email,
    subject,
    html,
  });
};

export default addMailJob;
