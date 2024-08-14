import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBookmark, getBookmarks } from "./api/bookmarks";
import "./Bookmarks.css";

export function Bookmarks() {
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });
  const mutation = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <section className="bookmark-list">
      <ul>
        {data.map((bookmark) => (
          <li key={bookmark.id}>
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
              {bookmark.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
