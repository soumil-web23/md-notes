import TopNav from "./TopNav"

export default function Editor(props){
  const {text, setText} = props
    return(
        <section className="notes-container">
        <TopNav {...props}/>
        <textarea value={text} onChange={setText} placeholder="Start typing.."></textarea>       

      </section>
    )
}