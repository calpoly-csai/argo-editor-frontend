import {useEffect, useState} from "react"
import axios from "axios"

import api from "../api"

type TourGraphList = {[id : string] : TourGraph};

export default function useTourGraph(): TourGraphList {
    const [tours, setTours] = useState<TourGraphList>({});
    useEffect(() => {
        api.getTours().then((tours : TourGraphList) => setTours(tours))
    }, [])

    return tours
}