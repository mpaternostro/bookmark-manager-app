import { useContext } from "react";
import {
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  OverlayTriggerStateContext,
} from "react-aria-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBookmark, getBookmarks } from "./api/bookmarks";
import { Button } from "./ui/Button/Button";
import { TextField } from "./ui/TextField/TextField";
import "./styles/Dialog.css";
import "./Bookmarks.css";

export function Bookmarks() {
  const { data, isPending, error } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
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
      <DialogTrigger>
        <Button>Add Bookmark</Button>
        <ModalOverlay>
          <Modal>
            <Dialog>
              {({ close }) => (
                <>
                  <div className="dialog-heading-container">
                    <Heading slot="title">Add Bookmark</Heading>
                    <Button onPress={close} aria-label="Close">
                      ❌
                    </Button>
                  </div>
                  <AddBookmarkForm />
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </section>
  );
}

function AddBookmarkForm() {
  const { close: closeDialog } = useContext(OverlayTriggerStateContext);
  const queryClient = useQueryClient();
  const { mutateAsync: addBookmarkMutate } = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      closeDialog();
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
