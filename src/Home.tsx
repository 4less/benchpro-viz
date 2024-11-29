
import Markdown from 'react-markdown'
import upload_content from './../content/upload.md?raw';

export function HomePage() {
    return (
        <div style={{ textAlign: 'left', justifyContent: "top" }}>
            <Markdown>{upload_content}</Markdown>
        </div>
    )
}