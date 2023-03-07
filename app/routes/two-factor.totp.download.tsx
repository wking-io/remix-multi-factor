import Button from "~/components/kits/Button";
import Form from "~/components/kits/FormKit";

export default function TwoFactorTOTPDownload() {
  return (
    <div>
      <p>Download the app please!</p>
      <Form action="/two-factor/totp" method="delete">
        <Button>Cancel</Button>
      </Form>
      <Button to="/two-factor/totp/setup">Next: Setup</Button>
    </div>
  );
}
