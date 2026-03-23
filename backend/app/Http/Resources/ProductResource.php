<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'            => $this->slug,
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
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}