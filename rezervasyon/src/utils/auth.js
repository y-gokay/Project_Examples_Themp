export const isAdmin = (user) => {
  if (!user) return false;

  if (user.email === "admin@admin.com") return true;

  if (user.role === "admin") return true;

  return false;
};

export const isUser = (user) => {
  if (!user) return false;

  if (user.email === "user@example.com") return true;

  if (user.role === "user") return true;

  return false;
};

export const getUserRole = (user) => {
  if (!user) return "guest";

  if (isAdmin(user)) return "admin";
  if (isUser(user)) return "user";

  return "unknown";
};

