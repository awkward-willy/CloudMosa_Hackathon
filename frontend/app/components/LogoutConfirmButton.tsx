
import { Button } from "@chakra-ui/react";
import { logout } from "../actions/auth";

export default function LogoutConfirmButton() {
    return (
        // yes no button, if no, go back to previous page
        <form action={logout}>
            <Button color="white" bg="green.600" margin="0.5rem" borderRadius="lg" fontSize="lg" type="submit">Yes</Button>
            <Button color="white" bg="red.600" margin="0.5rem" borderRadius="lg" fontSize="lg">No</Button>
        </form>
    )
}