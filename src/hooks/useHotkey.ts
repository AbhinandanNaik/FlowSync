import { useEffect, useCallback } from 'react'

type KeyCombo = string // e.g. 'ctrl+k', 'shift+?'

export function useHotkey(combo: KeyCombo, callback: () => void, enabled = true) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return

        const parts = combo.toLowerCase().split('+')
        const key = parts[parts.length - 1]
        const needsCtrl = parts.includes('ctrl') || parts.includes('meta')
        const needsShift = parts.includes('shift')
        const needsAlt = parts.includes('alt')

        const ctrlMatch = needsCtrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey)
        const shiftMatch = needsShift ? e.shiftKey : !e.shiftKey
        const altMatch = needsAlt ? e.altKey : !e.altKey

        if (e.key.toLowerCase() === key && ctrlMatch && shiftMatch && altMatch) {
            e.preventDefault()
            callback()
        }
    }, [combo, callback, enabled])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])
}
