import Button from "~/components/kits/Button";

export default function Index() {
  return (
    <main className="relative flex min-h-screen items-center justify-center gap-4 bg-white">
      <Button to="/sign-up">Sign Up</Button>
      <Button to="/sign-in" variant="ghost">
        Sign In
      </Button>
    </main>
  );
}
