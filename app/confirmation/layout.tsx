import { CheckoutProvider } from "../../context/CheckoutContext";

export default function ConfirmationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CheckoutProvider>{children}</CheckoutProvider>;
}
