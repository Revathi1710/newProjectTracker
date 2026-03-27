<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id ?? $this->route('product');

        return [
            'name'            => ['sometimes', 'required', 'string', 'max:255'],
            'code'            => ['sometimes', 'required', 'string', 'max:100', "unique:products,code,{$productId}"],
            'slug'            => ['sometimes', 'required', 'string', 'max:255', "unique:products,slug,{$productId}"],
            'published_in'    => ['sometimes', 'required', 'string', 'max:255'],
            'format'          => ['nullable', 'string', 'max:100'],
            'total_projects'  => ['nullable', 'integer', 'min:0'],
            'description'     => ['nullable', 'string'],
            'highlights'      => ['nullable', 'string'],
            'status'          => ['sometimes', 'required', 'in:active,inactive'],
            'price'           => ['sometimes', 'required', 'numeric', 'min:0', 'max:9999999.99'],
            'quantity'        => ['sometimes', 'required', 'integer', 'min:0'],
            'images'          => ['nullable', 'array', 'max:10'],
            'images.*'        => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            'remove_images'   => ['nullable', 'array'],
            'remove_images.*' => ['integer', 'exists:product_images,id'],

            // Excel / CSV — replaces any existing file when provided
           'excel_file' => [
    'nullable',
    'file',
    'mimetypes:application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/csv,text/plain,application/octet-stream',
    'max:20480',
],

            // Allow the client to explicitly delete the existing excel without uploading a new one
            'remove_excel'    => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'           => 'Product Name',
            'code'           => 'Product Code',
            'slug'           => 'Slug',
            'published_in'   => 'Published In',
            'format'         => 'Format',
            'total_projects' => 'Total Projects',
            'description'    => 'Description',
            'highlights'     => 'Highlights',
            'status'         => 'Status',
            'price'          => 'Price',
            'quantity'       => 'Quantity',
            'images'         => 'Product Images',
            'images.*'       => 'Image',
            'remove_images'  => 'Images to Remove',
            'excel_file'     => 'Excel File',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique'             => 'This product code is already in use. Please choose a different one.',
            'slug.unique'             => 'This slug is already in use. Please choose a different one.',
            'price.min'               => 'Price cannot be negative.',
            'quantity.min'            => 'Quantity cannot be negative.',
            'images.*.image'          => 'Each uploaded file must be a valid image.',
            'images.*.max'            => 'Each image must not exceed 10 MB.',
            'remove_images.*.exists'  => 'One or more selected images do not exist.',
            'excel_file.mimes'        => 'The data file must be an Excel (.xlsx, .xls) or CSV file.',
            'excel_file.max'          => 'The Excel file must not exceed 20 MB.',
        ];
    }
}