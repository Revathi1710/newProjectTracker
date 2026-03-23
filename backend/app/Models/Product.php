<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'slug',
        'code',
        'published_in',
        'format',
        'total_projects',
        'description',
        'highlights',
        'status',
        'price',
        'quantity',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
       
        'total_projects' => 'integer',
        'price'          => 'decimal:2',
        'quantity'       => 'integer',
    ];

    /**
     * Relationship: a product has many images.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Scope: only active products.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: only inactive products.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Accessor: check if product is active.
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }
}