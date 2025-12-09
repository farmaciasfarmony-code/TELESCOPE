import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Upload, X } from 'lucide-react';
import { addProduct, getProduct, updateProduct } from '../../services/productService';
import { categories } from '../../data/products';
import './AdminProductForm.css';

const initialFormState = {
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    discount: '',
    image: '',
    barcode: '',
    status: 'active'
};

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({ ...initialFormState });
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const product = await getProduct(id);
                    if (product) {
                        setFormData({
                            name: product.name || '',
                            category: product.category || '',
                            price: product.price || '',
                            stock: product.stock || '',
                            description: product.description || '',
                            discount: product.discount || '',
                            image: product.image || '',
                            barcode: product.barcode || '',
                            status: product.status || 'active'
                        });
                    } else {
                        setError('Producto no encontrado');
                    }
                } catch (err) {
                    setError('Error al cargar el producto');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            setError("Por favor, selecciona un archivo de imagen válido.");
            return;
        }

        setUploadingImage(true);
        setError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Crear un canvas para redimensionar/comprimir
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar si es muy grande (Max 800px ancho/alto)
                const MAX_SIZE = 800;
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a Base64 (JPEG con calidad 0.7 para ahorrar espacio)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                // Verificar tamaño final (Firestore tiene límite de 1MB por documento)
                // Un string Base64 es aprox 33% más grande que el binario.
                // 700KB es un buen límite seguro.
                if (dataUrl.length > 1000000) {
                    setError("La imagen es demasiado compleja incluso después de comprimir. Intenta con una más simple.");
                    setUploadingImage(false);
                    return;
                }

                console.log("Imagen procesada a Base64. Longitud:", dataUrl.length);
                setFormData(prev => ({ ...prev, image: dataUrl }));
                setUploadingImage(false);
            };
            img.onerror = () => {
                setError("Error al procesar la imagen.");
                setUploadingImage(false);
            };
            img.src = event.target.result;
        };
        reader.onerror = () => {
            setError("Error al leer el archivo.");
            setUploadingImage(false);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShowSuccess(false);

        // Clean data before sending
        const cleanedData = {
            ...formData,
            name: formData.name.trim(),
            category: formData.category.trim(),
            description: formData.description.trim(),
            barcode: (formData.barcode || '').trim(),
            image: formData.image.trim()
        };

        // Timeout promise to prevent infinite loading (10 seconds)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("La operación tardó demasiado. Verifica tu conexión.")), 10000)
        );

        try {
            if (isEditMode) {
                await Promise.race([updateProduct(id, cleanedData), timeoutPromise]);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                await Promise.race([addProduct(cleanedData), timeoutPromise]);
                setShowSuccess(true);
                setFormData({ ...initialFormState }); // Force clear form
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.name) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="admin-form-container">
            {showSuccess && (
                <div className="success-toast">
                    <CheckCircle size={20} />
                    {isEditMode ? 'Producto actualizado correctamente' : 'Producto creado. ¡Listo para el siguiente!'}
                </div>
            )}

            <div className="admin-form-header">
                <div className="admin-form-title">
                    <button onClick={() => navigate('/admin/products')} className="btn-back" title="Volver">
                        <ArrowLeft size={24} />
                    </button>
                    {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                </div>
            </div>

            <div className="admin-form-card">
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-section-title">Información Básica</div>

                        <div className="form-group">
                            <label className="form-label">Nombre del Producto</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Ej. Paracetamol 500mg"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="">Seleccionar categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Código de Barras / EAN</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ej. 750100012345"
                            />
                        </div>

                        <div className="form-section-title">Inventario y Precios</div>

                        <div className="form-group">
                            <label className="form-label">Precio ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="form-input"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Stock Disponible</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="form-input"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descuento (%)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="form-input"
                                placeholder="0"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Imagen del Producto</label>
                            <div className="image-upload-container">
                                {formData.image ? (
                                    <div className="image-preview-wrapper">
                                        <img src={formData.image} alt="Preview" className="image-preview" />
                                        <button type="button" onClick={removeImage} className="btn-remove-image" title="Eliminar imagen">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="image-upload-placeholder"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        {uploadingImage ? (
                                            <div className="spinner-small"></div>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Haz clic para subir una imagen</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>
                            <div className="mt-2">
                                <span className="text-xs text-gray-400">O ingresa una URL manualmente:</span>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="form-input mt-1"
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Descripción Detallada</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="form-textarea"
                                placeholder="Describe el producto..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="btn-cancel"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploadingImage}
                            className="btn-save"
                        >
                            <Save size={18} />
                            {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Producto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
