
import "./PopupForm.scss"
import {motion, Variants} from "framer-motion"
import { useEffect } from "react"
import {X} from "react-feather"

type PopupFormProps = {
    onSubmit: (e : React.FormEvent<HTMLFormElement>) => void,
    children : React.ReactNode,
    onClose : () => void
}

const cardVariants: Variants = {
    inactive: {
        scale : 0.7
    },
    active: {
        scale: 1.0
    }
}

const backdropVariants: Variants = {
    inactive: {
        opacity: 0
    },
    active: {
        opacity:1
    }
}


export default function PopupForm(props : PopupFormProps) {

    useEffect(() => {
        function exitOnEscape(e:KeyboardEvent) {
            if(e.key == "Escape") props.onClose()
        }
        document.onkeydown = exitOnEscape
        return () => void (document.onkeydown = null)
    }, [])

    function onSubmit(e : React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        props.onSubmit(e);
    }
    


    return <motion.div className="PopupForm" variants={backdropVariants} exit="inactive" animate="active" initial="inactive" transition={{duration: 0.3, type:"tween"}} >
        <div className="backdrop" onClick={props.onClose}>
        </div>
        <motion.div className="card" variants={cardVariants} animate="active" initial="inactive" exit="inactive" transition={{duration: 0.3, type:"tween"}}>
        <nav>
            <button className="wrapper" onClick={props.onClose}><X/></button>
        </nav>
        <form onSubmit={onSubmit}  >
        {props.children}
        </form>
        </motion.div>
        
    </motion.div>
}