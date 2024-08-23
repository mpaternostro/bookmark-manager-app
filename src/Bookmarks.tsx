import { useContext, useState } from "react";
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
import {
  addBookmark,
  deleteBookmark,
  getBookmarks,
  updateBookmark,
} from "./api/bookmarks";
import { Bookmark } from "./types/bookmarks";
import { Button } from "./ui/Button/Button";
import { TextField } from "./ui/TextField/TextField";
import "./Bookmarks.css";

export function Bookmarks() {
  const { data, isPending, error } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });
  const [editDialogOpen, setEditDialogOpen] = useState<{
    id: number | null;
    open: boolean;
  }>({ id: null, open: false });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const handleOpenEditDialog = (id: number) => {
    setEditDialogOpen({ id, open: true });
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen({ id: null, open: false });
  };

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
            <ItemMenu
              id={item.id}
              handleOpenEditDialog={handleOpenEditDialog}
            />
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
      <DialogTrigger
        isOpen={editDialogOpen.open}
        onOpenChange={handleCloseEditDialog}
      >
        <ModalOverlay>
          <Modal>
            <Dialog>
              <>
                <div className="dialog-heading-container">
                  <Heading slot="title">Edit Bookmark</Heading>
                  <Button onPress={handleCloseEditDialog} aria-label="Close">
                    ❌
                  </Button>
                </div>
                <EditBookmarkForm
                  bookmark={data.find(({ id }) => editDialogOpen.id === id)}
                />
              </>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </section>
  );
}

function ItemMenu({
  id,
  handleOpenEditDialog,
}: {
  id: number;
  handleOpenEditDialog: (id: number) => void;
}) {
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
      {/* should have a way to open with keyboard while focused */}
      <Popover>
        <Menu>
          <MenuItem onAction={() => handleOpenEditDialog(id)}>Edit</MenuItem>
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

function EditBookmarkForm({ bookmark }: { bookmark: Bookmark | undefined }) {
  const { close: closeDialog } = useContext(OverlayTriggerStateContext);
  const queryClient = useQueryClient();
  const { mutateAsync: updateBookmarkMutate } = useMutation({
    mutationFn: updateBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      closeDialog();
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
