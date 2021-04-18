import {useEffect, useMemo, useState} from "react"
import axios from "axios"
import {useParams} from "react-router-dom"
import {produce} from "immer"


import Api from "../api"

// Autosave timeout in ms
const AUTOSAVE_DEBOUNCE_INTERVAL = 2000
let timerId: number = -1;

type TourGraphDict = {[id : string] : TourGraph};

const listeners: React.Dispatch<React.SetStateAction<TourGraphDict>>[] = []
let tourGraphs: TourGraphDict = {}

function updateTourGraphs(mutation: (graphs: TourGraphDict) => void, tourId?: string) {
    tourGraphs = produce(tourGraphs, mutation);
    listeners.forEach(l => l(tourGraphs));
    if (tourId != null) {
        const save = () => Api.updateTourGraph(tourId, tourGraphs[tourId]);
        window.clearTimeout(timerId);
        timerId = window.setTimeout(save, AUTOSAVE_DEBOUNCE_INTERVAL);
    }
}

function useListener() {
    const listener = useState(tourGraphs)[1]

    useEffect(function addListener() {
        listeners.push(listener)
        return () => {
            const i = listeners.findIndex(l => l === listener);
            listeners.splice(i,1)
        }
    },[])
}

export function fetchGraph() {
    Api.getTours().then((tours: TourGraphDict) => {
        tourGraphs = tours
        listeners.forEach(l => l(tourGraphs));
    })
}

export function useSaveTour() {
    const {tourId} = useParams<{tourId? : string}>();
    return function saveTour() {
        if(!tourId) return;
        Api.updateTourGraph(tourId, tourGraphs[tourId])
    }
}

export function useTourList() {
    useListener()
    const list = useMemo(() => Object.entries(tourGraphs).map(([id, {title}]) => ({title, id})), [tourGraphs]);
    return list;
}

type TourUpdater = (mutation: (tour : TourGraph) => TourGraph) => void;

export function useTour() : [TourGraph, TourUpdater] {
    useListener()
    const {tourId} = useParams<{tourId? : string}>();
    const tour:TourGraph = tourId && tourGraphs[tourId] ? tourGraphs[tourId] : {title: "", description: "", locations:{}}
    function updateTour(mutation: (tour : TourGraph) => TourGraph) {
        if(tourId && tourGraphs[tourId])
            updateTourGraphs(graphs => {
                graphs[tourId] = produce(graphs[tourId], mutation)
                return graphs;
            }, tourId);
    }
    return [tour, updateTour]
}

type LocationUpdater = (mutation: (location : TourLocation) => void) => void;

export function useTourLocation() : [TourLocation, LocationUpdater] {
    useListener()
    const {tourId, locationName} = useParams<{tourId? : string, locationName?:string}>();
    if(tourId && locationName && tourGraphs[tourId]) {
        const tour: TourLocation = tourGraphs[tourId].locations[locationName];
        const updateLocation: LocationUpdater = mutation => {
            updateTourGraphs(graphs => {
                graphs[tourId].locations[locationName] = produce(graphs[tourId].locations[locationName], mutation)
            }, tourId)
        }
        return [tour, updateLocation]
    } else {
        const dummyTour = {title: "", description: "", panorama:"", overlays: []}
        const dummyUpdater: LocationUpdater = (mutation) => (location : TourLocation) => location
        return[dummyTour,  dummyUpdater]
    }
    
}