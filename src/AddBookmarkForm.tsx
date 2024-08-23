import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBookmark } from "./api/bookmarks";
import { Button } from "./ui/Button/Button";
import { TextField } from "./ui/TextField/TextField";
import "./Bookmarks.css";

export function AddBookmarkForm({
  handleCloseDialog,
}: {
  handleCloseDialog: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: addBookmarkMutate } = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      handleCloseDialog();
      toast.success("Bookmark added");
    },
    onError: (error) => {
      toast.error("Failed to add bookmark", {
        // bug shown below modal overlay
        description: error.message,
      });
    },
  });

  const handleAddBookmark: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const url = formData.get("url") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await addBookmarkMutate({ url, title, description });
  };

  return (
    <form name="add-bookmark-form" onSubmit={handleAddBookmark}>
      <TextField name="url" label="URL" />
      <TextField name="title" label="Title" />
      <TextField name="description" label="Description" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
