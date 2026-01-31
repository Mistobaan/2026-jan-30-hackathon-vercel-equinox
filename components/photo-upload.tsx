"use client"

import React from "react"

import { useState, useRef } from "react"
import { Upload, X, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 3 }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith("image/"))
    const remainingSlots = maxPhotos - photos.length
    const filesToProcess = imageFiles.slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        onPhotosChange([...photos, base64])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
            <img src={photo || "/placeholder.svg"} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors",
              isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            )}
          >
            <Camera className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add photo</span>
          </button>
        )}
      </div>
      
      {photos.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          )}
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">Upload your reference photos</p>
            <p className="text-sm text-muted-foreground">Face + full body shots work best</p>
          </div>
          <Button variant="outline" size="sm">
            Choose files
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
