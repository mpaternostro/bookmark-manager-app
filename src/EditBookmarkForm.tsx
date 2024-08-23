import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookmark } from "./api/bookmarks";
import { Bookmark } from "./types/bookmarks";
import { Button } from "./ui/Button/Button";
import { TextField } from "./ui/TextField/TextField";
import "./Bookmarks.css";

export function EditBookmarkForm({
  bookmark,
  handleCloseDialog,
}: {
  bookmark: Bookmark | undefined;
  handleCloseDialog: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateBookmarkMutate } = useMutation({
    mutationFn: updateBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      handleCloseDialog();
      toast.success("Bookmark updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update bookmark", {
        // bug shown below modal overlay
        description: error.message,
      });
    },
  });

  const handleUpdateBookmark: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const id = parseInt(formData.get("id") as string);
    const url = formData.get("url") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await updateBookmarkMutate({ id, url, title, description });
  };

  return (
    <form name="add-bookmark-form" onSubmit={handleUpdateBookmark}>
      <TextField name="id" value={bookmark?.id.toString()} type="hidden" />
      <TextField name="url" label="URL" defaultValue={bookmark?.url} />
      <TextField name="title" label="Title" defaultValue={bookmark?.title} />
      <TextField
        name="description"
        label="Description"
        defaultValue={bookmark?.description}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
