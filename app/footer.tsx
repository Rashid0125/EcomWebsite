import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-amber-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Brovion Art</h3>
            <p className="text-amber-100">
              Handcrafted metal wall art and copper bottles, created with passion and precision.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-amber-100 hover:text-white" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-amber-100 hover:text-white" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-amber-100 hover:text-white" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products/wall-art" className="text-amber-100 hover:text-white">
                  Metal Wall Art
                </Link>
              </li>
              <li>
                <Link href="/products/copper-bottles" className="text-amber-100 hover:text-white">
                  Copper Bottles
                </Link>
              </li>
              <li>
                <Link href="#" className="text-amber-100 hover:text-white">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="#" className="text-amber-100 hover:text-white">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-amber-100 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-amber-100 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-amber-100 hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-amber-100 hover:text-white">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="#" className="text-amber-100 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 shrink-0 text-amber-100" />
                <span className="text-amber-100">123 Artisan Street, Craft City, CC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-amber-100" />
                <span className="text-amber-100">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-amber-100" />
                <span className="text-amber-100">info@brovionart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-amber-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-amber-100 text-sm">© {new Date().getFullYear()} Brovion Art. All rights reserved.</div>
            <div className="flex flex-wrap gap-4 md:justify-end text-sm">
              <Link href="#" className="text-amber-100 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="text-amber-100 hover:text-white">
                Terms of Service
              </Link>
              <Link href="#" className="text-amber-100 hover:text-white">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

