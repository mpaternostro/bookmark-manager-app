import { Bookmark } from "../types/bookmarks";

export async function getBookmarks(): Promise<Bookmark[]> {
  const response = await fetch("http://localhost:3000/bookmarks", {
    credentials: "include",
  });
  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
}

export async function addBookmark(body: {
  url: string;
  title: string;
  description: string;
}) {
  const response = await fetch("http://localhost:3000/bookmarks/new", {
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

export async function deleteBookmark(id: number) {
  const response = await fetch(`http://localhost:3000/bookmarks/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (response.ok) {
    return true;
  }
  throw new Error(response.statusText);
}
