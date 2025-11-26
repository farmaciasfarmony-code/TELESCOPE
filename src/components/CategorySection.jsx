import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Baby, Sparkles, Activity, Apple, Heart } from 'lucide-react';
import { categories as dataCategories } from '../data/products';
import '../App.css';

const iconMap = {
    'Medicamentos': Pill,
    'Higiene': Sparkles,
    'Bebés': Baby,
    'Vitaminas': Activity,
    'Alimentos': Apple,
    'Cuidado Personal': Heart
};

const CategorySection = () => {
    return (
        <section className="category-section" id="productos">
            <h2 className="section-title">Nuestros Departamentos</h2>
            <div className="category-grid">
                {dataCategories.map((category) => {
                    const Icon = iconMap[category.name] || Pill;
                    return (
                        <Link to={`/category/${category.name}`} key={category.id} className="category-card">
                            <Icon size={40} className="category-icon" />
                            <span className="category-name">{category.name}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default CategorySection;
