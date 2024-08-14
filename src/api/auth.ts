import { CurrentUser } from "../types/auth";

export async function whoami(): Promise<CurrentUser> {
  const response = await fetch("http://localhost:3000/auth/whoami", {
    credentials: "include",
  });
  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
}

export async function login(body: {
  username: string;
  password: string;
}): Promise<CurrentUser> {
  const response = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
}

export async function logout() {
  const response = await fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (response.ok) {
    return response.text();
  }
  throw new Error(response.statusText);
}
