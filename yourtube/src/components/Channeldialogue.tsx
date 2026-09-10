import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import axiosInstance from '@/lib/axiosinstance';
import { useUser } from '@/lib/AuthContext';

const Channeldialogue = ({isopen, onclose, channeldata, mode}: any) => {
    const { user, login, } = useUser();
    // const user: any = {
    //     id: "1",
    //     name: "John Doe",
    //     email: "john@example.com",
    //     image: "https://github.com/shadcn.png?height=32&width=32",
    // };

    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "", description:"",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(()=>{
        if(channeldata && mode==="edit"){
            setFormData({
                name:channeldata.name || "",
                description: channeldata.description || ""
            })
        } else {
            setFormData({
                name: user?.name || "",
                description: "",
            })
        }
    },[channeldata, mode, user])

    const handleChange = (e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const {name, value } = e.target;
        setFormData((prev)=>({...prev,[name]: value }))
    }

    const handleSubmit = async (e:FormEvent)=>{
        e.preventDefault();
        if (!user?._id) return;

        setIsSubmitting(true);
        const payload = {
            channelname: formData.name,
            description: formData.description,
        }

        try {
            const response = await axiosInstance.patch(`/user/update/${user._id}`, payload);
            login(response?.data)
            router.push(`/channel/${user._id}`)
            setFormData({
                name: "",
                description: "",
            })
            onclose()
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isopen} onOpenChange={onclose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode==="create" ? "Create your channel" : "Edit your channel"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="name">
                            Channel Name
                        </Label>
                        <Input id="name" name="name" value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">
                            Channel Description
                        </Label>
                        <Textarea id="description" name="description" 
                            value={formData.description} 
                            onChange={handleChange} rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={onclose}>Cancel</Button>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? "Saving..": mode==="create"?"Create channel": "Save changes"}        
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default Channeldialogue
