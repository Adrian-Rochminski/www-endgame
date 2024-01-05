import {Background} from "@/components/background";
import { PrimeReactProvider } from 'primereact/api';

export const Providers = ({ children }) => {
    return (
    <Background>
        <PrimeReactProvider>
            {children}
        </PrimeReactProvider>
    </Background>
    )
};