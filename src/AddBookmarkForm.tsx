import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBookmark } from "./api/bookmarks";
import { CurrentTabData } from "./types/bookmarks";
import { Button } from "./ui/Button/Button";
import { TextField } from "./ui/TextField/TextField";
import "./Bookmarks.css";

export function AddBookmarkForm({
  currentTabData,
  handleClearCurrentTabData,
  handleCloseDialog,
}: {
  currentTabData: CurrentTabData | null;
  handleClearCurrentTabData: () => void;
  handleCloseDialog: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutateAsync: addBookmarkMutate } = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      handleCloseDialog();
      handleClearCurrentTabData();
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
      <TextField name="url" label="URL" defaultValue={currentTabData?.url} />
      <TextField
        name="title"
        label="Title"
        defaultValue={currentTabData?.title}
      />
      <TextField
        name="description"
        label="Description"
        defaultValue={currentTabData?.description}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
