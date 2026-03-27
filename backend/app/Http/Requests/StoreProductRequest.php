<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'code'           => ['required', 'string', 'max:100', 'unique:products,code'],
            'slug'           => ['required', 'string', 'max:255', 'unique:products,slug'],
            'published_in'   => ['required', 'string', 'max:255'],
            'format'         => ['nullable', 'string', 'max:100'],
            'total_projects' => ['nullable', 'integer', 'min:0'],
            'description'    => ['nullable', 'string'],
            'highlights'     => ['nullable', 'string'],
            'status'         => ['required', 'in:active,inactive'],
            'price'          => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'quantity'       => ['required', 'integer', 'min:0'],

            // Product images
            'images'         => ['nullable', 'array', 'max:10'],
            'images.*'       => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],

            // Excel / CSV data file (optional, single file)
           
            'excel_file' => [
    'nullable',
    'file',
    'mimetypes:application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/csv,text/plain,application/octet-stream',
    'max:20480',
],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'           => 'Product Name',
            'code'           => 'Product Code',
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
            'excel_file'     => 'Excel File',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique'          => 'This product code is already in use. Please choose a different one.',
            'price.min'            => 'Price cannot be negative.',
            'quantity.min'         => 'Quantity cannot be negative.',
            'images.*.image'       => 'Each uploaded file must be a valid image.',
            'images.*.max'         => 'Each image must not exceed 10 MB.',
            'excel_file.mimes'     => 'The data file must be an Excel (.xlsx, .xls) or CSV file.',
            'excel_file.max'       => 'The Excel file must not exceed 20 MB.',
        ];
    }
}