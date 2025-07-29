'use client'
import Editor from "@/components/Editor"
import { marked } from "marked";
import React from "react";
import Mdx from "@/components/Mdx"
import SideNav from "@/components/SideNav"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/firebase"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function NotesPage() {
    const [isViewer, setIsViewer] = useState(true)
    const [showNav, setShowNav] = useState(false)
    const [note, setNote] = useState({
        content: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [noteIds, setNoteIds] = useState([])
    const [savingNote, setSavingNote] = useState(false)

    const { currentUser, isLoadingUser } = useAuth()

    const searchParams = useSearchParams()


    function handleToggleViewer() {
        // isViewer = !isViewer
        setIsViewer(!isViewer)
    }

    function handleToggleMenu() {
        setShowNav(!showNav)
    }

    function handleCreateNote() {
        // create a new note
        setNote({
            content: ''
        })
        setIsViewer(false)
        window.history.replaceState(null, '', '/notes')
    }

    function handleEditNote(e) {
        // edit an existing note
        setNote({ ...note, content: e.target.value })
    }

    async function handleSaveNote() {
        if (!note?.content) { return }
        setSavingNote(true)
        try {
            // see if note already exists in database
            if (note.id) {
                // then we have an existing note cause we have it's id, so write to existing note
                const noteRef = doc(db, 'users', currentUser.uid, 'notes', note.id)
                await setDoc(noteRef, {
                    ...note
                }, { merge: true })
            } else {
                // that means that it's a brand new note and will only contain the content field, so we can basically save a new note to firebase
                const newId = note.content.replaceAll('#', '').slice(0, 15) + '__' + Date.now()
                const notesRef = doc(db, 'users', currentUser.uid, 'notes', newId)
                const newDocInfo = await setDoc(notesRef, {
                    content: note.content,
                    createdAt: serverTimestamp()
                })
                setNoteIds(curr => [...curr, newId])
                setNote({ ...note, id: newId })
                window.history.pushState(null, '', `?id=${newId}`)
            }
        } catch (err) {
            console.log(err.message)
        } finally {
            setSavingNote(false)
        }
    }
    async function handlePdfDownload() {
    if (!note?.content) return;

    const htmlContent = marked.parse(note.content);

    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    element.style.padding = "20px";
    element.style.color = "#000"; // Ensure black text on white PDF

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
        .set({
            margin: 0.5,
            filename: `${note.id?.split("__")[0] || "note"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
}

    useEffect(() => {
        // locally cache notes in a global context (like the one we already have, you perhaps just need an extra state)
        const value = searchParams.get('id')

        if (!value || !currentUser) { return }

        async function fetchNote() {
            if (isLoading) { return }
            try {
                setIsLoading(true)
                console.log('FETCHING DATA')
                const noteRef = doc(db, 'users', currentUser.uid, 'notes', value)
                const snapshot = await getDoc(noteRef)
                const docData = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
                if (docData) {
                    setNote({ ...docData })
                }
            } catch (err) {
                console.log(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchNote()
    }, [currentUser, searchParams])


    if (isLoadingUser) {
        return (
            <h6 className="text-gradient">Loading...</h6>
        )
    }

    if (!currentUser) {
        // if no user found, then boot them to the home page cause this is the notes page (for auth users only)
        window.location.href = '/'
    }

    return (
        <main id="notes">
            <SideNav setIsViewer={setIsViewer} handleCreateNote={handleCreateNote} noteIds={noteIds} setNoteIds={setNoteIds} showNav={showNav} setShowNav={setShowNav} />
            {!isViewer && (
                <Editor handlePdfDownload={handlePdfDownload} savingNote={savingNote} handleSaveNote={handleSaveNote} handleToggleMenu={handleToggleMenu} setText={handleEditNote} text={note.content} isViewer={isViewer} handleToggleViewer={handleToggleViewer} />
            )}
            {isViewer && (
                <Mdx handlePdfDownload={handlePdfDownload}savingNote={savingNote} handleSaveNote={handleSaveNote} handleToggleMenu={handleToggleMenu} text={note.content} isViewer={isViewer} handleToggleViewer={handleToggleViewer} />
            )}
        </main>
    )
}
