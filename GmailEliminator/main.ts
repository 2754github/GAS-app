const myFunction = () =>
  GmailApp.search('in:inbox is:read -is:starred').forEach((thread) => thread.moveToTrash());
