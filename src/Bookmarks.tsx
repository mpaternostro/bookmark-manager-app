import { useContext } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  GridList,
  GridListItem,
  Heading,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  ModalOverlay,
  OverlayTriggerStateContext,
  Popover,
} from "react-aria-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBookmark, deleteBookmark, getBookmarks } from "./api/bookmarks";
import { Button } from "./ui/Button/Button";
import { TextField } from "./ui/TextField/TextField";
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
    <section>
      <GridList
        aria-label="Bookmark List"
        selectionMode="none"
        items={data}
        renderEmptyState={() => "No results found."}
      >
        {(item) => (
          <GridListItem
            textValue={item.title}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.title}
            <ItemMenu id={item.id} />
          </GridListItem>
        )}
      </GridList>
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

function ItemMenu({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteBookmarkMutate } = useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete bookmark", {
        description: error.message,
      });
    },
  });

  return (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Menu>
          <MenuItem onAction={() => alert("open")}>Edit</MenuItem>
          <MenuItem
            onAction={async () => {
              await deleteBookmarkMutate(id);
            }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
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
