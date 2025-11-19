type GTMEvent = {
    event: string
    [key: string]: any
}

export const sendGTMEvent = (data: GTMEvent) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push(data)
    }
}
