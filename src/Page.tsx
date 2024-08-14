import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, whoami } from "./api/auth";
import { Button } from "./ui/Button/Button";
import { TextField } from "./ui/TextField/TextField";
import { Bookmarks } from "./Bookmarks";
import "./Page.css";

export function Page() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: whoami,
    retry: false,
  });
  const { mutateAsync: loginMutate } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
  const { mutateAsync: logoutMutate } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLogin: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    await loginMutate({ username, password });
  };

  const handleLogout: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    await logoutMutate();
  };

  return (
    <main>
      {data ? (
        <section className="main-section">
          <header>
            <h1>Hello {data.username}</h1>
            <form onSubmit={handleLogout}>
              <Button type="submit">Logout</Button>
            </form>
          </header>
          <Bookmarks />
        </section>
      ) : (
        <form name="login-form" onSubmit={handleLogin}>
          <TextField label="Username" name="username" />
          <TextField
            label="Password"
            name="password"
            description="Password must be at least 8 characters."
            type="password"
          />
          <Button type="submit">Login</Button>
        </form>
      )}
    </main>
  );
}
