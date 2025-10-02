import React, { useRef, useContext } from 'react'
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from 'next-auth/react'
import { CartContext } from '@/components/Context/CartContext'

export default function Checkout({cartId} : { cartId: string}) {
    const { data: session } = useSession()
    const { setCartData } = useContext(CartContext)

    const detailsInput = useRef<HTMLInputElement | null>(null);
    const cityInput = useRef<HTMLInputElement | null>(null);
    const phoneInput = useRef<HTMLInputElement | null>(null);

    async function checkoutSession() {
        if (!session?.token) {
            alert('Please login to proceed with checkout')
            return
        }
              const shippingAddress = {
                details: detailsInput.current?.value,
                city: cityInput.current?.value,
                phone: phoneInput.current?.value,
              }
              console.log(shippingAddress);


        const successUrl = '';
        const response = await fetch(`${process.env.URL_API || 'https://ecommerce.routemisr.com/api/v1'}/orders/checkout-session/${cartId}?url=${encodeURIComponent(successUrl)}`, {
            method: 'POST',
            body : JSON.stringify({shippingAddress}),
            headers: {
                    token : session.token,
                    "content-Type": "application/json"
                }
              });
              const data = await response.json();


              if (data.status == 'success') {
                // Ensure absolute URL for redirect to avoid path duplication
                location.href = new URL(data.session.url, window.location.origin).toString();

            }
        }

    async function cashOnDelivery() {
        if (!session?.token) {
            alert('Please login to proceed with checkout')
            return
        }
        const shippingAddress = {
            details: detailsInput.current?.value,
            city: cityInput.current?.value,
            phone: phoneInput.current?.value,
        }
        console.log(shippingAddress);

        const response = await fetch('/api/create-cash-order', {
            method: 'POST',
            body: JSON.stringify({
                cartId,
                shippingAddress
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        if (data.status === 'success') {
            setCartData(null);
            location.href = `${window.location.origin}/allorders`;
        } else {
            alert('Failed to create order: ' + (data.message || 'Unknown error'));
        }
    }
    

  return (
    <>
        

        <Dialog>
      <form>
        <DialogTrigger asChild>
                <button className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-md transition-colors w-full cursor-pointer">
                        Proceed to checkout
                </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Shipping Address</DialogTitle>
            <DialogDescription>
                Please Add Shipping Address
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="city">City</Label>
              <Input ref={cityInput} id="city" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="details">Details</Label>
              <Input ref={detailsInput} id="details" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Phone</Label>
              <Input ref={phoneInput} id="phone" />
            </div>
            
          </div>
          <DialogFooter>
            <Button onClick={cashOnDelivery} type="button" className='cursor-pointer' variant="outline">Cash on delivery</Button>
            <Button onClick={checkoutSession} className='bg-red-500 hover:bg-red-600 cursor-pointer' type="button">Bank</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
    </>
  )
}
