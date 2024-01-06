import { Inter } from 'next/font/google'
import './globals.css'
import "primereact/resources/themes/lara-light-cyan/theme.css";
import {Providers} from "@/providers";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ParkingOS',
  description: 'Park with us',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <Providers>
              {children}
          </Providers>
      </body>
    </html>
  )
}
