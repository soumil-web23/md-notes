import { Suspense } from 'react'
import NotesClient from './NotesClient'

export default function NotesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NotesClient />
        </Suspense>
    )
}
