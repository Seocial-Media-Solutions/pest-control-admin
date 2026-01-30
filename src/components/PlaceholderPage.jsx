const PlaceholderPage = ({ title, description, icon: Icon }) => {
    return (
        <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="text-center">
                <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                    {Icon && <Icon className="w-12 h-12 text-white" />}
                </div>
                <h1 className="text-3xl font-bold text-dark-text mb-3">{title}</h1>
                <p className="text-dark-text-secondary max-w-md mx-auto">
                    {description || 'This page is under construction. Check back soon!'}
                </p>
            </div>
        </div>
    );
};

export default PlaceholderPage;
