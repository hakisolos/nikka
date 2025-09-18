function isAdmin(metadata, userId) {
  if (!metadata || !metadata.participants || !userId) return false;

  const participant = metadata.participants.find(
    p => p.jid === userId || p.lid === userId
  );

  if (!participant) return false;

  return participant.admin === "admin" || participant.admin === "superadmin";
}
