<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'code'           => $this->code,
            'published_in'   => $this->published_in,
            'format'         => $this->format,
            'total_projects' => $this->total_projects,
            'description'    => $this->description,
            'highlights'     => $this->highlights,
            'status'         => $this->status,
            'is_active'      => $this->is_active,
            'price'          => (float) $this->price,
            'quantity'       => $this->quantity,
            'images'         => ProductImageResource::collection($this->whenLoaded('images')),

            // ── Excel file info ──────────────────────────────────────
            'excel_file'     => $this->excel_path ? [
                'original_name' => $this->excel_original_name,
                'filename'      => $this->excel_filename,
                'size'          => $this->excel_size,
                'mime'          => $this->excel_mime,
                // Full public URL so the frontend can show a download link
                'url'           => Storage::disk('public')->url($this->excel_path),
                // Convenience download route (see routes/api.php)
                'download_url'  => route('products.download-excel', $this->id),
            ] : null,

            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}