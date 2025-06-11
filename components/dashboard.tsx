"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Camera, Database, EyeOff } from "lucide-react"

interface DetectedObject {
  id: number
  label: string
  confidence: number
  timestamp: string
  camera_ip: string
}

const CAMERA_IPS = ["192.168.1.73", "192.168.1.101", "192.168.1.102", "192.168.1.103"]
const MODEL_LABELS = ["fire", "smoke", "person", "vehicle", "explosion"]

export function Dashboard() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([])
  const [alerts, setAlerts] = useState<string[]>([])

  const fetchDetections = async () => {
    const url = selectedLabels.length > 0
      ? `http://127.0.0.1:8000/detections?label=${selectedLabels[0]}`
      : `http://127.0.0.1:8000/detections`

    try {
      const res = await fetch(url)
      const data = await res.json()
      setDetectedObjects(data.map((d: any[]) => ({
        id: d[0],
        label: d[1],
        confidence: d[2] / 100,
        camera_ip: d[3],
        timestamp: d[4],
      })))
    } catch (err) {
      console.error("Failed to fetch detection data:", err)
    }
  }

  useEffect(() => {
    fetchDetections()
    const interval = setInterval(fetchDetections, 5000)
    return () => clearInterval(interval)
  }, [selectedLabels])

  const filteredObjects = useMemo(() => {
    return selectedLabels.length > 0
      ? detectedObjects.filter((obj) => selectedLabels.includes(obj.label))
      : detectedObjects
  }, [selectedLabels, detectedObjects])

  useEffect(() => {
    if (selectedLabels.length > 0) {
      const newAlerts = detectedObjects
        .filter((obj) => selectedLabels.includes(obj.label))
        .map((obj) => `${obj.label.toUpperCase()} detected on camera ${obj.camera_ip}`)

      setAlerts([...new Set(newAlerts)])
    } else {
      setAlerts([])
    }
  }, [detectedObjects, selectedLabels])

  const handleLabelToggle = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const toggleDetection = async () => {
    if (!selectedCamera) return alert("Select a camera first")
    const url = isDetecting
      ? `http://127.0.0.1:8000/stop-detection?camera_ip=${selectedCamera}`
      : `http://127.0.0.1:8000/start-detection?camera_ip=${selectedCamera}`
    try {
      await fetch(url, { method: 'POST' })
      setIsDetecting(!isDetecting)
    } catch (err) {
      alert("Failed to contact backend")
      console.error(err)
    }
  }

  const buildRtspUrl = (ip: string) => `rtsp://admin:123456Ai@${ip}:554/snl/live/1/3`

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI CCTV</h1>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={toggleDetection} variant={isDetecting ? "destructive" : "default"}>
              {isDetecting ? "Stop Detection" : "Start Detection"}
            </Button>
            <Badge variant={isDetecting ? "default" : "destructive"}>
              {isDetecting ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" /> Camera Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMERA_IPS.map((ip) => (
                      <SelectItem key={ip} value={ip}>Camera {ip}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Live Feed</CardTitle></CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white text-sm">
                  {selectedCamera ? (
                    isDetecting ? (
                      <img
                        src={`http://localhost:8000/stream?camera_url=${encodeURIComponent(buildRtspUrl(selectedCamera))}`}
                        alt="Live Camera"
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <EyeOff className="h-8 w-8 mx-auto mb-2" />
                        <p>Detection stopped</p>
                      </div>
                    )
                  ) : (
                    <p>Select a camera to view feed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Filter by Labels</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MODEL_LABELS.map((label) => (
                    <div key={label} className="flex items-center space-x-2">
                      <Checkbox
                        id={label}
                        checked={selectedLabels.includes(label)}
                        onCheckedChange={() => handleLabelToggle(label)}
                      />
                      <label htmlFor={label} className="text-sm font-medium capitalize">{label}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {alerts.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" /> Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{alert}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" /> Detection Results
                  {selectedLabels.length > 0 && (
                    <Badge variant="secondary">Filtered: {selectedLabels.join(", ")}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Camera IP</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredObjects.length > 0 ? (
                        filteredObjects.map((obj) => (
                          <TableRow key={obj.id}>
                            <TableCell className="font-medium">{obj.id}</TableCell>
                            <TableCell>
                              <Badge variant={obj.label === "fire" || obj.label === "smoke" ? "destructive" : "default"} className="capitalize">
                                {obj.label}
                              </Badge>
                            </TableCell>
                            <TableCell>{(obj.confidence * 100).toFixed(1)}%</TableCell>
                            <TableCell>{obj.camera_ip}</TableCell>
                            <TableCell>{obj.timestamp}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            {selectedLabels.length > 0
                              ? "No objects detected for selected labels"
                              : "No objects detected"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">YOLO-based Fire Detection System</div>
      </div>
    </div>
  )
}
