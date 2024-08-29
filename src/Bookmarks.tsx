import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  GridList,
  GridListItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBookmark, getBookmarks } from "./api/bookmarks";
import { CurrentTabData } from "./types/bookmarks";
import { Button } from "./ui/Button/Button";
import { Dialog } from "./ui/Dialog/Dialog";
import { AddBookmarkForm } from "./AddBookmarkForm";
import { EditBookmarkForm } from "./EditBookmarkForm";
import "./Bookmarks.css";

export function Bookmarks() {
  const { data, isPending, error } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<{
    id: number | null;
    open: boolean;
  }>({ id: null, open: false });
  const [currentTabData, setCurrentTabData] = useState<CurrentTabData | null>(
    null
  );

  const handleOpenAddDialog = () => setAddDialogOpen(true);
  const handleCloseAddDialog = () => setAddDialogOpen(false);
  const handleOpenEditDialog = (id: number) =>
    setEditDialogOpen({ id, open: true });
  const handleCloseEditDialog = () =>
    setEditDialogOpen({ id: null, open: false });
  const handleClearCurrentTabData = () => setCurrentTabData(null);

  useEffect(() => {
    function getTabData() {
      return {
        title: document.title,
        description:
          document
            .querySelector("meta[name=description]")
            ?.getAttribute("content") ?? undefined,
        url: window.location.href,
      };
    }

    if ("tabs" in window.chrome) {
      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(async ([tab]) => {
          if (tab?.id) {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: getTabData,
            });
            const data = results[0]?.result;
            if (data) {
              setCurrentTabData(data);
              handleOpenAddDialog();
            }
          }
        });
    }

    return () => {};
  }, []);

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
            <ItemMenu
              id={item.id}
              handleOpenEditDialog={handleOpenEditDialog}
            />
          </GridListItem>
        )}
      </GridList>
      <Button onPress={handleOpenAddDialog}>Add Bookmark</Button>
      <Dialog
        title="Add Bookmark"
        isOpen={addDialogOpen}
        onOpenChange={handleCloseAddDialog}
      >
        <AddBookmarkForm
          handleCloseDialog={handleCloseAddDialog}
          handleClearCurrentTabData={handleClearCurrentTabData}
          currentTabData={currentTabData}
        />
      </Dialog>
      <Dialog
        title="Edit Bookmark"
        isOpen={editDialogOpen.open}
        onOpenChange={handleCloseEditDialog}
      >
        <EditBookmarkForm
          bookmark={data.find(({ id }) => editDialogOpen.id === id)}
          handleCloseDialog={handleCloseEditDialog}
        />
      </Dialog>
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
