import Markdown from "markdown-to-jsx";
import TopNav from "./TopNav";
import { PDFViewer } from "@react-pdf/renderer";
import React from "react";
import { jsPDF } from "jspdf";

export default function MDX(props) {
    const { text } = props // gives us access to the text attribute (or the value assigned to it really)
    const printRef = React.useRef(null); // create a ref to the element we want to print

    return (
        <section className="mdx-container">
            <TopNav {...props} />
            <article>
                    <div>
                        <Markdown>
                            {text.trim() || 'Hop in the editor to create a new note'}
                        </Markdown>
                    </div>
            </article>
        </section>
    )
}
