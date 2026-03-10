import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateDialog({ open, onClose, type, folders = [], onSubmit }) {
  const [name, setName] = useState("");
  const [folderId, setFolderId] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), folder_id: folderId || null });
    setName("");
    setFolderId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Create {type === "folder" ? "Folder" : "Workout"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder={type === "folder" ? "e.g., Push Day" : "e.g., Chest Focus"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          
          {type === "workout" && folders.length > 0 && (
            <div className="space-y-2">
              <Label>Folder (optional)</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="No folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full" disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}