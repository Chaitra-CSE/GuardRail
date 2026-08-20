import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const RouterContext = createContext(null);

export const BrowserRouter = ({ children }) => {
    const [location, setLocation] = useState(() => ({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
        hash: window.location.hash || '',
        state: null,
    }));

    useEffect(() => {
        const handlePopState = (event) => {
            setLocation({
                pathname: window.location.pathname || '/',
                search: window.location.search || '',
                hash: window.location.hash || '',
                state: event.state || null,
            });
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = useCallback((to, options = {}) => {
        let path = '';
        let search = '';
        let hash = '';

        if (typeof to === 'number') {
            window.history.go(to);
            return;
        }

        if (typeof to === 'string') {
            const url = new URL(to, window.location.origin);
            path = url.pathname;
            search = url.search;
            hash = url.hash;
        } else if (typeof to === 'object') {
            path = to.pathname || window.location.pathname;
            search = to.search || '';
            hash = to.hash || '';
        }

        const fullUrl = `${path}${search}${hash}`;

        if (options.replace) {
            window.history.replaceState(options.state || null, '', fullUrl);
        } else {
            window.history.pushState(options.state || null, '', fullUrl);
        }

        setLocation({
            pathname: path || '/',
            search: search,
            hash: hash,
            state: options.state || null,
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const value = useMemo(() => ({
        location,
        navigate,
    }), [location, navigate]);

    return (
        <RouterContext.Provider value={value}>
            {children}
        </RouterContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(RouterContext);
    if (!context) {
        return {
            pathname: window.location.pathname || '/',
            search: window.location.search || '',
            hash: window.location.hash || '',
            state: null,
        };
    }
    return context.location;
};

export const useNavigate = () => {
    const context = useContext(RouterContext);
    if (!context) {
        return (to) => {
            if (typeof to === 'string') window.location.href = to;
        };
    }
    return context.navigate;
};

export const useSearchParams = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const setSearchParams = useCallback((nextInit, options = {}) => {
        let nextSearchParams;
        if (typeof nextInit === 'function') {
            nextSearchParams = nextInit(new URLSearchParams(location.search));
        } else if (nextInit instanceof URLSearchParams) {
            nextSearchParams = nextInit;
        } else {
            nextSearchParams = new URLSearchParams(nextInit);
        }

        const nextSearch = nextSearchParams.toString();
        const searchStr = nextSearch ? `?${nextSearch}` : '';

        navigate(`${location.pathname}${searchStr}${location.hash}`, {
            replace: options.replace ?? true,
            state: options.state ?? location.state,
        });
    }, [location.pathname, location.search, location.hash, location.state, navigate]);

    return [searchParams, setSearchParams];
};

export const Link = ({ to, children, className = '', onClick, style, ...rest }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (onClick) onClick(e);
        if (
            !e.defaultPrevented &&
            e.button === 0 &&
            (!rest.target || rest.target === '_self') &&
            !e.metaKey &&
            !e.ctrlKey &&
            !e.altKey &&
            !e.shiftKey
        ) {
            e.preventDefault();
            navigate(to);
        }
    };

    return (
        <a href={to} onClick={handleClick} className={className} style={style} {...rest}>
            {children}
        </a>
    );
};

export const NavLink = ({ to, children, className = '', activeClassName = '', style, ...rest }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

    const computedClassName = typeof className === 'function'
        ? className({ isActive })
        : `${className} ${isActive ? activeClassName : ''}`.trim();

    return (
        <Link to={to} className={computedClassName} style={style} {...rest}>
            {typeof children === 'function' ? children({ isActive }) : children}
        </Link>
    );
};

export const Routes = ({ children }) => {
    const location = useLocation();
    const childrenArray = React.Children.toArray(children);

    const currentPath = (location.pathname || '/').replace(/\/$/, '') || '/';

    let match = null;
    let fallback = null;

    for (const child of childrenArray) {
        if (!React.isValidElement(child)) continue;
        const { path, element } = child.props;
        const routePath = (path || '').replace(/\/$/, '') || '/';

        if (path === '*') {
            fallback = element;
        } else if (routePath === currentPath) {
            match = element;
            break;
        }
    }

    return match || fallback || null;
};

export const Route = ({ path, element }) => {
    return element;
};
