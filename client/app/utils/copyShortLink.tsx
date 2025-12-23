'use client';

import { useState } from "react";

export default function CopyLink({linkToCopy}: {linkToCopy: string}) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if(navigator.clipboard) {
                await navigator.clipboard.writeText(linkToCopy);
                setIsCopied(true);
            }
            else {
                console.error({error: "Clipboard API not available"});
                alert("Clipboard API is not available in your browser");
            }
        }
        catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    return (
        <button
        onClick={handleCopy}
        style={{cursor:'pointer', padding:"0 30px", backgroundColor:"black", borderRadius:'10px'}}
        >
            {isCopied ? 'Copied' : 'Copy'}
        </button>
    );
}