        // 마우스 스와이프 기능
        // 상단 탭 드래그 상태 관리
        let topTabsDragging = false;
        let topTabsHasMoved = false;
        
        function initSwipeContainers() {
            document.querySelectorAll('.swipe-container').forEach(container => {
                // 이미 초기화된 컨테이너는 건너뛰기
                if (container.dataset.swipeInit) return;
                container.dataset.swipeInit = 'true';
                
                // 상단 탭은 CSS 스크롤만 사용 (클릭 이벤트 보존)
                if (container.id === 'top-tabs-scroll') {
                    return;
                }
                
                let isDown = false;
                let startX;
                let scrollLeft;
                let hasMoved = false;
                let moveDistance = 0;
                
                // 마우스 이벤트
                container.addEventListener('mousedown', (e) => {
                    // 버튼이나 클릭 가능한 요소는 제외
                    if (e.target.closest('button, a, .clickable, .grid-card-image, .grid-card-name, .slide-card, .product-image-wrap, .product-name')) return;
                    
                    isDown = true;
                    hasMoved = false;
                    moveDistance = 0;
                    container.classList.add('grabbing');
                    startX = e.pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                });
                
                container.addEventListener('mouseleave', () => {
                    isDown = false;
                    container.classList.remove('grabbing');
                });
                
                container.addEventListener('mouseup', (e) => {
                    isDown = false;
                    container.classList.remove('grabbing');
                });
                
                container.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    hasMoved = true;
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2;
                    moveDistance = Math.abs(x - startX);
                    container.scrollLeft = scrollLeft - walk;
                });
            });
        }

        // 카테고리 데이터 (모바일 최적화)
        const CATEGORIES = [
            {
                name: '농수축산',
                icon: '🥬',
                subs: ['야채/채소', '과일', '쌀/잡곡', '축산/계란', '수산/건어물', '견과']
            },
            {
                name: '가공식품',
                icon: '🥫',
                subs: ['장류/양념/소스', '식용유/조미료', '면/라면/밀가루', '유제품/냉장/냉동', '캔/통조림', '김/반찬/편의식', '생수/음료', '커피/티백', '빵/스낵/안주', '건강식품', '반려동물용품']
            },
            {
                name: '주방용품',
                icon: '🍳',
                subs: ['일회용품/소모품', '조리도구', '식기/밀폐용기', '프라이팬/주전자', '냄비/솥/찜기']
            },
            {
                name: '생활용품',
                icon: '🧹',
                subs: ['주방잡화', '욕실잡화', '생활잡화', '캠핑용품', '사무/자동차용품']
            },
            {
                name: '대용량/박스',
                icon: '📦',
                subs: ['대용량 농산물', '대용량 축산물', '대용량 수산물', '대용량 장류/양념', '대용량 냉장/냉동', '대용량 가공식품', '대용량 음료/커피', '대용량 소모품/세제', '대용량 식기/도구', '바로장보고']
            }
        ];

        // 카테고리 팝업 열기
        function openCategoryPopup() {
            const modal = document.getElementById('category-modal');
            modal.classList.add('active');
            renderCategories();
            document.body.style.overflow = 'hidden';
        }

        // 카테고리 팝업 닫기
        function closeCategoryPopup() {
            const modal = document.getElementById('category-modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // 카테고리 렌더링
        function renderCategories() {
            const body = document.getElementById('category-modal-body');
            body.innerHTML = CATEGORIES.map((cat, idx) => `
                <div class="category-group" id="cat-group-${idx}">
                    <div class="category-group-header">
                        <h4 onclick="selectCategory('${cat.name}', '전체보기')">${cat.icon} ${cat.name}</h4>
                        <svg class="category-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="event.stopPropagation(); toggleCategoryGroup(${idx})">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </div>
                    <div class="category-sub-list">
                        ${cat.subs.map(sub => `
                            <div class="category-sub-item" onclick="selectCategory('${cat.name}', '${sub}')">${sub}</div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        // 카테고리 그룹 토글
        function toggleCategoryGroup(idx) {
            const group = document.getElementById(`cat-group-${idx}`);
            group.classList.toggle('expanded');
        }

        // 현재 선택된 카테고리 상태
        let currentMainCategory = '';
        let currentSubCategory = '';
        let currentEventFilter = '전체';

        function selectCategory(mainCat, subCat) {
            closeCategoryPopup();
            currentMainCategory = mainCat;
            currentSubCategory = subCat;
            currentEventFilter = '전체';
            navigateToCategoryPage(mainCat, subCat);
        }

        // 카테고리 페이지로 이동
        function navigateToCategoryPage(mainCat, subCat) {
            // 모든 페이지 비활성화
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-category').classList.add('active');
            
            // 하단 네비게이션 비활성화
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            
            // 페이지 타이틀 설정
            if (subCat && subCat !== '전체보기') {
                document.getElementById('category-page-title').textContent = `${mainCat} - ${subCat}`;
            } else {
                document.getElementById('category-page-title').textContent = mainCat;
            }
            
            // 하위 카테고리 탭 렌더링
            renderCategorySubTabs(mainCat, subCat || '전체보기');
            
            // 이벤트 탭 렌더링
            renderCategoryEventTabs(mainCat, '전체', subCat || '전체보기');
            
            // 상품 목록 렌더링 (서브카테고리 필터링)
            renderCategoryProducts(mainCat, subCat || '전체보기', '전체');
            
            // 스크롤 맨 위로
            window.scrollTo(0, 0);
        }
        
        // 이벤트 탭 렌더링
        function renderCategoryEventTabs(mainCat, activeEvent, subCat) {
            const allEventTabs = ['전체', '공동구매', '오늘만할인', '신상특가', '오픈특가', '전단행사', '정육', '과일', '가공식품', '생활용품'];
            
            // 해당 카테고리의 모든 상품 가져오기
            let allProducts = CATEGORY_ALL_PRODUCTS[mainCat] || [];
            
            // 소분류가 선택된 경우 해당 소분류 상품만 필터링
            if (subCat && subCat !== '전체보기') {
                allProducts = allProducts.filter(p => p.subCat === subCat);
            }
            
            // 상품이 있는 이벤트 타입만 필터링 (전체는 항상 포함)
            const availableEventTabs = allEventTabs.filter(event => {
                if (event === '전체') return true;
                return allProducts.some(p => p.eventType === event);
            });
            
            const tabsContainer = document.getElementById('category-event-tabs');
            tabsContainer.innerHTML = availableEventTabs.map(event => `
                <button class="category-event-tab ${event === activeEvent ? 'active' : ''}" onclick="selectCategoryEventTab('${mainCat}', '${event}')">${event}</button>
            `).join('');
        }
        
        // 이벤트 탭 선택
        function selectCategoryEventTab(mainCat, eventName) {
            currentEventFilter = eventName;
            renderCategoryEventTabs(mainCat, eventName, currentSubCategory);
            renderCategoryProducts(mainCat, currentSubCategory || '전체보기', eventName);
        }

        // 하위 카테고리 탭 렌더링 (전체보기 + 소분류 탭)
        function renderCategorySubTabs(mainCat, activeTab) {
            // 해당 대분류의 소분류 목록 가져오기
            const category = CATEGORIES.find(c => c.name === mainCat);
            const subCategories = category ? category.subs : [];
            
            const tabsContainer = document.getElementById('category-sub-tabs');
            tabsContainer.innerHTML = `
                <button class="category-sub-tab ${activeTab === '전체보기' ? 'active' : ''}" onclick="selectCategoryTab('${mainCat}', '전체보기')">전체보기</button>
                ${subCategories.map(subCat => `
                    <button class="category-sub-tab ${subCat === activeTab ? 'active' : ''}" onclick="selectCategoryTab('${mainCat}', '${subCat}')">${subCat}</button>
                `).join('')}
            `;
        }

        // 카테고리 탭 선택
        function selectCategoryTab(mainCat, tabName) {
            currentSubCategory = tabName;
            currentEventFilter = '전체'; // 소분류 변경 시 이벤트 필터 초기화
            
            // 타이틀 업데이트
            if (tabName && tabName !== '전체보기') {
                document.getElementById('category-page-title').textContent = `${mainCat} - ${tabName}`;
            } else {
                document.getElementById('category-page-title').textContent = mainCat;
            }
            
            renderCategorySubTabs(mainCat, tabName);
            renderCategoryEventTabs(mainCat, '전체', tabName); // 이벤트 탭도 다시 렌더링
            renderCategoryProducts(mainCat, tabName, '전체');
        }

        // 하위 카테고리 선택 (소분류 - 모달에서 선택 시)
        function selectSubCategory(mainCat, subCat) {
            currentSubCategory = subCat;
            currentEventFilter = '전체'; // 소분류 변경 시 이벤트 필터 초기화
            // 소분류 선택 시 해당 소분류 상품만 표시
            renderCategorySubTabs(mainCat, '전체보기');
            renderCategoryEventTabs(mainCat, '전체', subCat); // 이벤트 탭도 다시 렌더링
            renderCategoryProducts(mainCat, subCat, '전체');
        }

        // 카테고리별 전체 상품 데이터 (할인상품 + 일반상품)
        const CATEGORY_ALL_PRODUCTS = {
            '농수축산': [
                // 할인 상품
                { id: 501, name: '국내산 삼겹살 100g', price: 8900, originalPrice: 10000, discount: 11, subCat: '축산/계란', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/101438_1.jpg' },
                { id: 502, name: '제주 흑돼지 목살 200g', price: 15800, originalPrice: 18000, discount: 12, subCat: '축산/계란', eventType: '오늘만할인', image: 'https://apibaemin.jangerp.com/thumb/104500_1.jpg' },
                { id: 503, name: '신선한 사과 5개입', price: 12900, originalPrice: 15000, discount: 14, subCat: '과일', eventType: '신상특가', image: 'https://apibaemin.jangerp.com/thumb/101180_1.jpg' },
                { id: 504, name: '유기농 시금치 200g', price: 3500, originalPrice: 4000, discount: 12, subCat: '야채/채소', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/100110_1.jpg' },
                { id: 505, name: '달콤한 바나나 1송이', price: 2730, originalPrice: 3500, discount: 22, subCat: '과일', eventType: '오늘만할인', image: 'https://apibaemin.jangerp.com/thumb/100046_1.jpg' },
                { id: 506, name: '신선한 계란 30구', price: 8500, originalPrice: 9500, discount: 11, subCat: '축산/계란', eventType: '신상특가', image: 'https://apibaemin.jangerp.com/thumb/100188_1.jpg' },
                { id: 507, name: '손질 고등어 2팩', price: 9800, originalPrice: 11000, discount: 11, subCat: '수산/건어물', eventType: '오늘만할인', image: 'https://apibaemin.jangerp.com/thumb/100189_1.jpg' },
                { id: 508, name: '볶음 아몬드 500g', price: 12000, originalPrice: 14000, discount: 14, subCat: '견과', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/100190_1.jpg' },
                // 일반 상품 (할인 없음)
                { id: 509, name: '양배추 1통', price: 3500, subCat: '야채/채소', image: 'https://apibaemin.jangerp.com/thumb/100211_1.jpg' },
                { id: 510, name: '감자 1kg', price: 4500, subCat: '야채/채소', image: 'https://apibaemin.jangerp.com/thumb/100212_1.jpg' },
                { id: 511, name: '고구마 1kg', price: 5500, subCat: '야채/채소', image: 'https://apibaemin.jangerp.com/thumb/100426_1.jpg' },
                { id: 512, name: '딸기 500g', price: 8900, subCat: '과일', image: 'https://apibaemin.jangerp.com/thumb/100167_1.jpg' },
                { id: 513, name: '귤 2kg', price: 9900, subCat: '과일', image: 'https://apibaemin.jangerp.com/thumb/100047_1.jpg' },
                { id: 514, name: '쌀 10kg', price: 32000, subCat: '쌀/잡곡', image: 'https://apibaemin.jangerp.com/thumb/101180_1.jpg' },
                { id: 515, name: '찹쌀 2kg', price: 12000, subCat: '쌀/잡곡', image: 'https://apibaemin.jangerp.com/thumb/101438_1.jpg' },
                { id: 516, name: '한우 등심 200g', price: 28000, subCat: '축산/계란', image: 'https://apibaemin.jangerp.com/thumb/104500_1.jpg' },
                { id: 517, name: '닭가슴살 500g', price: 7500, subCat: '축산/계란', image: 'https://apibaemin.jangerp.com/thumb/100110_1.jpg' },
                { id: 518, name: '오징어 2마리', price: 12000, subCat: '수산/건어물', image: 'https://apibaemin.jangerp.com/thumb/100188_1.jpg' },
                { id: 519, name: '호두 300g', price: 8500, subCat: '견과', image: 'https://apibaemin.jangerp.com/thumb/100189_1.jpg' },
            ],
            '가공식품': [
                // 할인 상품
                { id: 601, name: '고추장 1kg', price: 8900, originalPrice: 10000, discount: 11, subCat: '장류/양념/소스', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/100211_1.jpg' },
                { id: 602, name: '진간장 1.8L', price: 7500, originalPrice: 8500, discount: 12, subCat: '장류/양념/소스', eventType: '오늘만할인', image: 'https://apibaemin.jangerp.com/thumb/100212_1.jpg' },
                { id: 603, name: '신라면 5개입', price: 3800, originalPrice: 4200, discount: 10, subCat: '면/라면/밀가루', eventType: '신상특가', image: 'https://apibaemin.jangerp.com/thumb/100426_1.jpg' },
                { id: 604, name: '참기름 500ml', price: 12500, originalPrice: 14000, discount: 11, subCat: '식용유/조미료', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/100110_1.jpg' },
                { id: 605, name: '서울우유 1L', price: 2500, originalPrice: 2900, discount: 14, subCat: '유제품/냉장/냉동', eventType: '오늘만할인', image: 'https://apibaemin.jangerp.com/thumb/100046_1.jpg' },
                // 일반 상품
                { id: 606, name: '된장 500g', price: 5500, subCat: '장류/양념/소스', image: 'https://apibaemin.jangerp.com/thumb/100167_1.jpg' },
                { id: 607, name: '식용유 1.8L', price: 6900, subCat: '식용유/조미료', image: 'https://apibaemin.jangerp.com/thumb/100047_1.jpg' },
                { id: 608, name: '짜파게티 5개입', price: 4200, subCat: '면/라면/밀가루', image: 'https://apibaemin.jangerp.com/thumb/100188_1.jpg' },
                { id: 609, name: '치즈 슬라이스 10매', price: 4500, subCat: '유제품/냉장/냉동', image: 'https://apibaemin.jangerp.com/thumb/100189_1.jpg' },
                { id: 610, name: '참치캔 3개입', price: 6500, subCat: '캔/통조림', image: 'https://apibaemin.jangerp.com/thumb/100190_1.jpg' },
                { id: 611, name: '김 도시락용 20봉', price: 5900, subCat: '김/반찬/편의식', image: 'https://apibaemin.jangerp.com/thumb/100211_1.jpg' },
                { id: 612, name: '생수 2L 6개입', price: 4500, subCat: '생수/음료', image: 'https://apibaemin.jangerp.com/thumb/100212_1.jpg' },
                { id: 613, name: '맥심 커피믹스 100입', price: 18900, subCat: '커피/티백', image: 'https://apibaemin.jangerp.com/thumb/100426_1.jpg' },
                { id: 614, name: '새우깡', price: 1500, subCat: '빵/스낵/안주', image: 'https://apibaemin.jangerp.com/thumb/100110_1.jpg' },
            ],
            '주방용품': [
                // 할인 상품
                { id: 701, name: '일회용 수저 100개입', price: 5900, originalPrice: 7000, discount: 16, subCat: '일회용품/소모품', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/100167_1.jpg' },
                { id: 702, name: '스텐 프라이팬 28cm', price: 29000, originalPrice: 35000, discount: 17, subCat: '프라이팬/주전자', eventType: '오늘만할인', image: 'https://apibaemin.jangerp.com/thumb/100188_1.jpg' },
                // 일반 상품
                { id: 703, name: '국자', price: 3500, subCat: '조리도구', image: 'https://apibaemin.jangerp.com/thumb/100189_1.jpg' },
                { id: 704, name: '도마', price: 8900, subCat: '조리도구', image: 'https://apibaemin.jangerp.com/thumb/100190_1.jpg' },
                { id: 705, name: '밀폐용기 세트', price: 15000, subCat: '식기/밀폐용기', image: 'https://apibaemin.jangerp.com/thumb/100211_1.jpg' },
                { id: 706, name: '냄비 세트', price: 45000, subCat: '냄비/솥/찜기', image: 'https://apibaemin.jangerp.com/thumb/100212_1.jpg' },
                { id: 707, name: '비닐백 100매', price: 3200, subCat: '일회용품/소모품', image: 'https://apibaemin.jangerp.com/thumb/100426_1.jpg' },
            ],
            '생활용품': [
                // 할인 상품
                { id: 801, name: '섬유유연제 3L', price: 8900, originalPrice: 10000, discount: 11, subCat: '생활잡화', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/100046_1.jpg' },
                { id: 802, name: '화장지 30롤', price: 15900, originalPrice: 18000, discount: 12, subCat: '욕실잡화', eventType: '신상특가', image: 'https://apibaemin.jangerp.com/thumb/100047_1.jpg' },
                // 일반 상품
                { id: 803, name: '고무장갑', price: 2500, subCat: '주방잡화', image: 'https://apibaemin.jangerp.com/thumb/100167_1.jpg' },
                { id: 804, name: '수세미 5개입', price: 3500, subCat: '주방잡화', image: 'https://apibaemin.jangerp.com/thumb/100188_1.jpg' },
                { id: 805, name: '샴푸 500ml', price: 8900, subCat: '욕실잡화', image: 'https://apibaemin.jangerp.com/thumb/100189_1.jpg' },
                { id: 806, name: '캠핑 의자', price: 25000, subCat: '캠핑용품', image: 'https://apibaemin.jangerp.com/thumb/100190_1.jpg' },
                { id: 807, name: 'A4 복사용지 500매', price: 7500, subCat: '사무/자동차용품', image: 'https://apibaemin.jangerp.com/thumb/100211_1.jpg' },
            ],
            '대용량/박스': [
                // 할인 상품
                { id: 901, name: '대용량 양파 10kg', price: 15900, originalPrice: 18000, discount: 12, subCat: '대용량 농산물', eventType: '공동구매', image: 'https://apibaemin.jangerp.com/thumb/100110_1.jpg' },
                { id: 902, name: '대용량 삼겹살 2kg', price: 45000, originalPrice: 52000, discount: 13, subCat: '대용량 축산물', eventType: '오늘만할인', image: 'https://apibaemin.jangerp.com/thumb/101438_1.jpg' },
                { id: 903, name: '대용량 고추장 3kg', price: 18900, originalPrice: 22000, discount: 14, subCat: '대용량 장류/양념', eventType: '신상특가', image: 'https://apibaemin.jangerp.com/thumb/100211_1.jpg' },
                // 일반 상품
                { id: 904, name: '대용량 감자 20kg', price: 28000, subCat: '대용량 농산물', image: 'https://apibaemin.jangerp.com/thumb/100212_1.jpg' },
                { id: 905, name: '대용량 닭고기 5kg', price: 35000, subCat: '대용량 축산물', image: 'https://apibaemin.jangerp.com/thumb/100426_1.jpg' },
                { id: 906, name: '대용량 고등어 박스', price: 42000, subCat: '대용량 수산물', image: 'https://apibaemin.jangerp.com/thumb/100188_1.jpg' },
                { id: 907, name: '대용량 만두 2kg', price: 18000, subCat: '대용량 냉장/냉동', image: 'https://apibaemin.jangerp.com/thumb/100189_1.jpg' },
                { id: 908, name: '대용량 커피 500입', price: 45000, subCat: '대용량 음료/커피', image: 'https://apibaemin.jangerp.com/thumb/100190_1.jpg' },
            ],
        };

        // 행사 타입 목록
        const EVENT_TYPES = ['공동구매', '오늘만할인', '신상특가', '오픈특가'];

        // 카테고리 상품 렌더링
        function renderCategoryProducts(mainCat, filterType, eventFilter) {
            const content = document.getElementById('category-page-content');
            
            // 해당 카테고리의 모든 상품 가져오기
            let allProducts = CATEGORY_ALL_PRODUCTS[mainCat] || [];
            
            // 소분류 필터링
            let products = [];
            if (filterType === '전체보기') {
                products = allProducts;
            } else {
                // 소분류로 필터
                products = allProducts.filter(p => p.subCat === filterType);
            }
            
            // 이벤트 필터링 (전체가 아닌 경우)
            if (eventFilter && eventFilter !== '전체') {
                products = products.filter(p => p.eventType === eventFilter);
            }
            
            if (products.length === 0) {
                content.innerHTML = `
                    <div class="category-empty">
                        <div class="icon">📦</div>
                        <p>해당 카테고리에 상품이 없습니다</p>
                    </div>
                `;
                return;
            }
            
            content.innerHTML = `
                <div class="category-products-grid">
                    ${products.map(p => {
                        const qty = quantities[p.id] || 1;
                        const hasDiscount = p.discount && p.originalPrice;
                        return `
                        <div class="category-product-card">
                            <div class="category-product-image" onclick="openProductDetail(${p.id})">
                                ${p.eventType ? `<span class="category-event-badge ${p.eventType}">${p.eventType}</span>` : ''}
                                <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">
                            </div>
                            <div class="category-product-info">
                                <p class="category-product-name" onclick="openProductDetail(${p.id})">${p.name}</p>
                                <div class="category-product-price-row">
                                    ${hasDiscount ? `<span class="category-product-discount">${p.discount}%</span>` : ''}
                                    <span class="category-product-price">${p.price.toLocaleString()}원</span>
                                </div>
                                ${hasDiscount ? `<span class="category-product-original">${p.originalPrice.toLocaleString()}원</span>` : ''}
                                <div class="category-product-actions">
                                    <div class="qty-control">
                                        <button class="qty-btn" onclick="changeCategoryQty(${p.id}, -1, ${p.price})">−</button>
                                        <span class="qty-value" id="cat-qty-${p.id}">${qty}</span>
                                        <button class="qty-btn" onclick="changeCategoryQty(${p.id}, 1, ${p.price})">+</button>
                                    </div>
                                    <button class="add-btn" onclick="addCategoryProductToCart(${p.id}, '${mainCat}')">담기</button>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            `;
        }

        // 카테고리 페이지 수량 변경
        function changeCategoryQty(productId, delta, price) {
            if (!quantities[productId]) quantities[productId] = 1;
            quantities[productId] = Math.max(1, quantities[productId] + delta);
            const qtyEl = document.getElementById(`cat-qty-${productId}`);
            if (qtyEl) qtyEl.textContent = quantities[productId];
        }

        // 카테고리 상품 장바구니 추가
        function addCategoryProductToCart(productId, mainCat) {
            // CATEGORY_ALL_PRODUCTS에서 상품 찾기
            let product = null;
            for (const cat in CATEGORY_ALL_PRODUCTS) {
                const found = CATEGORY_ALL_PRODUCTS[cat].find(p => p.id === productId);
                if (found) {
                    product = found;
                    break;
                }
            }
            
            if (!product) return;
            
            const qty = quantities[productId] || 1;
            const existing = cart.find(item => item.id === productId);
            
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || product.price,
                    image: product.image,
                    qty: qty,
                    category: mainCat
                });
            }
            
            // 수량 초기화
            quantities[productId] = 1;
            const qtyEl = document.getElementById(`cat-qty-${productId}`);
            if (qtyEl) qtyEl.textContent = '1';
            
            updateCartBadge();
            showToast(`${product.name} ${qty}개 장바구니 담기 완료!`);
        }

        const TABS = ['공동구매', '오늘만할인', '신상특가', '오픈특가', '정육', '과일', '가공식품', '생활용품'];
        
        const PRODUCTS = {
            '공동구매': [
                { id: 4, name: '안주야먹태열풍(양념치킨맛) 25G', price: 12600, originalPrice: 14300, discount: 11, image: 'https://apibaemin.jangerp.com/thumb/100167_1.jpg' },
                { id: 170, name: '동그랑땡 710G', price: 18000, originalPrice: 22900, discount: 21, image: 'https://apibaemin.jangerp.com/thumb/100188_1.jpg', badge: 'best' },
                { id: 35, name: '바이오드링킹요거트(스트로베리) 250MLx4입', price: 6000, originalPrice: 7000, discount: 14, image: 'https://apibaemin.jangerp.com/thumb/100046_1.jpg',
                    variants: [
                        { id: 35, name: '250MLx4입', price: 6000, originalPrice: 7000 },
                        { id: 351, name: '250MLx6입', price: 8500, originalPrice: 10000 },
                        { id: 352, name: '250MLx8입', price: 11000, originalPrice: 13000 }
                    ]
                },
                { id: 36, name: '바이오드링킹요거트(플레인) 250MLx4입', price: 8200, originalPrice: 10100, discount: 18, image: 'https://apibaemin.jangerp.com/thumb/100047_1.jpg',
                    variants: [
                        { id: 36, name: '250MLx4입', price: 8200, originalPrice: 10100 },
                        { id: 361, name: '250MLx6입', price: 12000, originalPrice: 14500 },
                        { id: 362, name: '250MLx8입', price: 15500, originalPrice: 18500 }
                    ]
                },
                { id: 3, name: '뽈항정살 400G', price: 12800, originalPrice: 14100, discount: 9, image: 'https://apibaemin.jangerp.com/thumb/100110_1.jpg', badge: 'hot',
                    variants: [
                        { id: 3, name: '400G', price: 12800, originalPrice: 14100 },
                        { id: 31, name: '800G', price: 24500, originalPrice: 27000 },
                        { id: 32, name: '1.2KG', price: 35000, originalPrice: 39000 }
                    ]
                },
                { id: 8, name: '홍천식야시장고추장삼겹살 160G', price: 9400, originalPrice: 10900, discount: 13, image: 'https://apibaemin.jangerp.com/thumb/100426_1.jpg' },
            ],
            '오늘만할인': [
                { id: 171, name: '프라임돈까스 490Gx2입', price: 11100, originalPrice: 13800, discount: 19, image: 'https://apibaemin.jangerp.com/thumb/100189_1.jpg', badge: 'hot',
                    variants: [
                        { id: 171, name: '490Gx2입', price: 11100, originalPrice: 13800 },
                        { id: 1711, name: '490Gx4입', price: 21000, originalPrice: 26000 },
                        { id: 1712, name: '490Gx6입', price: 30000, originalPrice: 38000 }
                    ]
                },
                { id: 172, name: '미니돈까스 400G', price: 11700, originalPrice: 14900, discount: 21, image: 'https://apibaemin.jangerp.com/thumb/100190_1.jpg' },
                { id: 173, name: '순살크리스피치킨 500G', price: 17200, originalPrice: 22100, discount: 22, image: 'https://apibaemin.jangerp.com/thumb/100211_1.jpg',
                    variants: [
                        { id: 173, name: '500G', price: 17200, originalPrice: 22100 },
                        { id: 1731, name: '1KG', price: 32000, originalPrice: 42000 }
                    ]
                },
                { id: 174, name: '한입쏙팝콘치킨 500G', price: 5800, originalPrice: 6600, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/100212_1.jpg', badge: 'new' },
                { id: 175, name: '크레잇크리스피너겟 1.5KG', price: 16400, originalPrice: 19000, discount: 13, image: 'https://apibaemin.jangerp.com/thumb/100261_1.jpg' },
                { id: 176, name: '크레잇한판145치킨까스 1.45KG', price: 15100, originalPrice: 17800, discount: 15, image: 'https://apibaemin.jangerp.com/thumb/100262_1.jpg' },
            ],
            '신상특가': [
                { id: 37, name: '딸기맛우유(키즈) 120ML', price: 2800, originalPrice: 3500, discount: 19, image: 'https://apibaemin.jangerp.com/thumb/100077_1.jpg', badge: 'new',
                    variants: [
                        { id: 37, name: '120ML 1개', price: 2800, originalPrice: 3500 },
                        { id: 371, name: '120ML 3개', price: 8000, originalPrice: 10000 },
                        { id: 372, name: '120ML 6개', price: 15000, originalPrice: 19000 }
                    ]
                },
                { id: 38, name: '메로나맛우유(단지) 240ML', price: 8300, originalPrice: 9100, discount: 8, image: 'https://apibaemin.jangerp.com/thumb/100116_1.jpg',
                    variants: [
                        { id: 38, name: '240ML 1개', price: 8300, originalPrice: 9100 },
                        { id: 381, name: '240ML 3개', price: 23000, originalPrice: 26000 },
                        { id: 382, name: '240ML 6개', price: 44000, originalPrice: 50000 }
                    ]
                },
                { id: 39, name: '파스퇴르우유 180ML', price: 3400, originalPrice: 3900, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/100118_1.jpg' },
                { id: 40, name: '테이스티치즈고칼슘 180G(10매)', price: 8900, originalPrice: 10100, discount: 11, image: 'https://apibaemin.jangerp.com/thumb/100125_1.jpg', badge: 'hot',
                    variants: [
                        { id: 40, name: '10매', price: 8900, originalPrice: 10100 },
                        { id: 401, name: '20매', price: 17000, originalPrice: 19500 },
                        { id: 402, name: '30매', price: 24000, originalPrice: 28000 }
                    ]
                },
                { id: 41, name: '바이오드링킹요거트(블루베리) 250MLx4입', price: 5300, originalPrice: 6100, discount: 13, image: 'https://apibaemin.jangerp.com/thumb/100171_1.jpg',
                    variants: [
                        { id: 41, name: '250MLx4입', price: 5300, originalPrice: 6100 },
                        { id: 411, name: '250MLx8입', price: 10000, originalPrice: 11500 }
                    ]
                },
                { id: 42, name: '그릭요거트(달지않은플레인) 90Gx4입', price: 2900, originalPrice: 3300, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/100210_1.jpg' },
            ],
            '오픈특가': [
                { id: 60, name: '미니단호박 3KG/국산', price: 19100, originalPrice: 22800, discount: 16, image: 'https://apibaemin.jangerp.com/thumb/10277_1.jpg' },
                { id: 61, name: '청양고추(경매) 10KG', price: 7000, originalPrice: 8400, discount: 16, image: 'https://apibaemin.jangerp.com/thumb/10287_1.jpg', badge: 'new' },
                { id: 62, name: '브로컬리 1봉/국산', price: 19700, originalPrice: 22300, discount: 11, image: 'https://apibaemin.jangerp.com/thumb/10339_1.jpg' },
                { id: 64, name: '삼색파프리카 1봉/국산', price: 8100, originalPrice: 10300, discount: 21, image: 'https://apibaemin.jangerp.com/thumb/10354_1.jpg', badge: 'hot' },
                { id: 67, name: '애기고추 1KG/국산', price: 15000, originalPrice: 17100, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/10458_1.jpg' },
                { id: 78, name: '백오이 10입/국산', price: 6500, originalPrice: 7800, discount: 17, image: 'https://apibaemin.jangerp.com/thumb/91970_1.jpg' },
            ],
            '정육': [
                { id: 85, name: '냉장우육(알목심) 100G/미국', price: 10900, originalPrice: 14100, discount: 22, image: 'https://apibaemin.jangerp.com/thumb/101438_1.jpg', badge: 'best' },
                { id: 86, name: '육우(등심) 100G/국산', price: 18800, originalPrice: 23100, discount: 18, image: 'https://apibaemin.jangerp.com/thumb/101439_1.jpg' },
                { id: 87, name: '육우(부채살) 100G/국산', price: 23000, originalPrice: 26400, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/101440_1.jpg', badge: 'hot' },
                { id: 88, name: '육우(안심) 100G/국산', price: 21700, originalPrice: 24900, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/101441_1.jpg' },
                { id: 89, name: '무항생제닭볶음탕용 1KG', price: 13800, originalPrice: 17400, discount: 20, image: 'https://apibaemin.jangerp.com/thumb/104497_1.jpg', badge: 'new' },
                { id: 90, name: '무항생제닭다리살(정육) 400G', price: 8500, originalPrice: 9800, discount: 13, image: 'https://apibaemin.jangerp.com/thumb/104500_1.jpg' },
            ],
            '과일': [
                { id: 102, name: '무지개망고 1팩(2입)/태국', price: 16500, originalPrice: 21000, discount: 21, image: 'https://apibaemin.jangerp.com/thumb/101021_1.jpg', badge: 'hot',
                    variants: [
                        { id: 102, name: '1팩(2입)', price: 16500, originalPrice: 21000 },
                        { id: 1021, name: '2팩(4입)', price: 31000, originalPrice: 40000 },
                        { id: 1022, name: '3팩(6입)', price: 45000, originalPrice: 58000 }
                    ]
                },
                { id: 103, name: '블랙망고수박(소) 1EA/국산', price: 20700, originalPrice: 25000, discount: 17, image: 'https://apibaemin.jangerp.com/thumb/101095_1.jpg' },
                { id: 105, name: '바나나(10손) 1손/필리핀', price: 2730, originalPrice: 3530, discount: 22, image: 'https://apibaemin.jangerp.com/thumb/101180_1.jpg', badge: 'best',
                    variants: [
                        { id: 105, name: '1손', price: 2730, originalPrice: 3530 },
                        { id: 1051, name: '3손', price: 7500, originalPrice: 10000 },
                        { id: 1052, name: '5손', price: 12000, originalPrice: 16000 }
                    ]
                },
                { id: 106, name: '살구(상) 1BOX/국산', price: 16900, originalPrice: 21200, discount: 20, image: 'https://apibaemin.jangerp.com/thumb/101323_1.jpg' },
                { id: 107, name: '체리 1팩/미국', price: 24000, originalPrice: 27600, discount: 13, image: 'https://apibaemin.jangerp.com/thumb/101341_1.jpg',
                    variants: [
                        { id: 107, name: '1팩', price: 24000, originalPrice: 27600 },
                        { id: 1071, name: '2팩', price: 46000, originalPrice: 53000 }
                    ]
                },
                { id: 108, name: '흑수박(특) 1통/국산', price: 17200, originalPrice: 20400, discount: 15, image: 'https://apibaemin.jangerp.com/thumb/101398_1.jpg', badge: 'new' },
            ],
            '가공식품': [
                { id: 128, name: '신라면더레드(멀티) 125Gx4입', price: 8800, originalPrice: 11200, discount: 21, image: 'https://apibaemin.jangerp.com/thumb/101987_1.jpg', badge: 'hot' },
                { id: 129, name: '마열라면(멀티) 120Gx4입', price: 8300, originalPrice: 9500, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/101990_1.jpg' },
                { id: 131, name: '맵탱마늘조개라면(멀티) 110Gx4입', price: 8500, originalPrice: 10600, discount: 19, image: 'https://apibaemin.jangerp.com/thumb/102174_1.jpg', badge: 'new' },
                { id: 133, name: '라면왕김통깨사발 79G', price: 3300, originalPrice: 4000, discount: 17, image: 'https://apibaemin.jangerp.com/thumb/102364_1.jpg' },
                { id: 138, name: '김치짜구리(큰사발) 107G', price: 10700, originalPrice: 13100, discount: 18, image: 'https://apibaemin.jangerp.com/thumb/105804_1.jpg' },
                { id: 150, name: '비빔면(멀티) 130Gx5입', price: 4500, originalPrice: 5200, discount: 13, image: 'https://apibaemin.jangerp.com/thumb/30494_1.jpg', badge: 'best' },
            ],
            '생활용품': [
                { id: 17, name: '아델콰트로3단파마우산', price: 13100, originalPrice: 14600, discount: 10, image: 'https://apibaemin.jangerp.com/thumb/101076_1.jpg' },
                { id: 18, name: '다용도웨이브매트 70*40CM', price: 14300, originalPrice: 16400, discount: 12, image: 'https://apibaemin.jangerp.com/thumb/101077_1.jpg', badge: 'hot' },
                { id: 19, name: '카와이2단네모라인우산', price: 3100, originalPrice: 3800, discount: 18, image: 'https://apibaemin.jangerp.com/thumb/101081_1.jpg' },
                { id: 20, name: '야옹이거실화', price: 3000, originalPrice: 3300, discount: 9, image: 'https://apibaemin.jangerp.com/thumb/102142_1.jpg', badge: 'new' },
                { id: 21, name: '차량용고속2포트충전기', price: 5300, originalPrice: 6200, discount: 14, image: 'https://apibaemin.jangerp.com/thumb/102858_1.jpg' },
                { id: 22, name: '덕용밴드 22매', price: 7900, originalPrice: 9900, discount: 20, image: 'https://apibaemin.jangerp.com/thumb/103841_1.jpg' },
            ],
        };

        const COUPONS = [
            { id: 1, type: 'general', brand: '장보고마트', name: '[특가]첫구매 할인쿠폰', discount: '10%', salePrice: 27000, originPrice: 30000, tag: '전체상품', expiry: '2025.01.31' },
            { id: 2, type: 'general', brand: '장보고마트', name: '[특가]신선식품 할인', discount: '2,000원', salePrice: 18000, originPrice: 20000, tag: '신선식품', expiry: '2025.01.15' },
            { id: 3, type: 'general', brand: '장보고마트', name: '[특가]가공식품 특가', discount: '15%', salePrice: 42500, originPrice: 50000, tag: '가공식품', expiry: '2025.02.28' },
            { id: 4, type: 'general', brand: '장보고마트', name: '[특가]생활용품 할인', discount: '3,000원', salePrice: 22000, originPrice: 25000, tag: '생활용품', expiry: '2025.01.20' },
            { id: 5, type: 'product', brand: '장보고마트', name: '바나나우유', productName: '바나나우유 240ml', discountAmount: 200, tag: '유제품', expiry: '2025.01.31', image: 'https://apibaemin.jangerp.com/thumb/100607_1.jpg' },
            { id: 6, type: 'product', brand: '장보고마트', name: '서울우유 1L', productName: '서울우유 1L', discountAmount: 300, tag: '유제품', expiry: '2025.01.25', image: 'https://apibaemin.jangerp.com/thumb/100034_1.jpg' },
            { id: 7, type: 'product', brand: '장보고마트', name: '계란 30구', productName: '계란 30구 1판', discountAmount: 500, tag: '축산/계란', expiry: '2025.02.10', image: 'https://apibaemin.jangerp.com/thumb/104497_1.jpg' },
            { id: 8, type: 'product', brand: '장보고마트', name: '순두부', productName: '풀무원 순두부 350g', discountAmount: 150, tag: '냉장식품', expiry: '2025.01.20', image: 'https://apibaemin.jangerp.com/thumb/100403_1.jpg' },
            { id: 9, type: 'product', brand: '장보고마트', name: '삼겹살', productName: '국내산 삼겹살 100g', discountAmount: 1000, tag: '정육', expiry: '2025.02.05', image: 'https://apibaemin.jangerp.com/thumb/101438_1.jpg' },
            { id: 10, type: 'product', brand: '장보고마트', name: '사과', productName: '부사 사과 1개', discountAmount: 200, tag: '과일', expiry: '2025.01.18', image: 'https://apibaemin.jangerp.com/thumb/101180_1.jpg' },
        ];

        let cart = [];
        let myCoupons = [];
        let orderHistory = []; // 주문 내역 저장
        let quantities = {};
        let currentCouponTab = 'available';
        
        // 알림 데이터
        let notifications = [
            { 
                id: 1, 
                type: 'order', 
                title: '주문이 완료되었습니다!', 
                desc: '주문번호 #20251231001 - 상품 준비중입니다. 곧 배송이 시작됩니다.',
                time: '방금 전',
                unread: true
            },
            { 
                id: 2, 
                type: 'coupon', 
                title: '🎉 신규 쿠폰이 발급되었습니다!', 
                desc: '연말특가 3,000원 할인쿠폰이 쿠폰함에 도착했어요. 지금 바로 사용해보세요!',
                time: '1시간 전',
                unread: true
            },
            { 
                id: 3, 
                type: 'event', 
                title: '오늘만 할인! 최대 50% 특가', 
                desc: '매일 새롭게 업데이트되는 오늘만할인 상품을 확인하세요. 놓치면 후회해요!',
                time: '어제',
                unread: false
            }
        ];
        
        // 매장 정보
        const STORES = [
            { id: 1, name: '장보고 반야월점', address: '대구 동구 반야월로 123' },
            { id: 2, name: '장보고 동대구점', address: '대구 동구 동대구로 456' },
            { id: 3, name: '장보고 수성점', address: '대구 수성구 수성로 789' },
            { id: 4, name: '장보고 달서점', address: '대구 달서구 달서대로 321' },
            { id: 5, name: '장보고 북구점', address: '대구 북구 칠곡중앙대로 654' },
        ];
        let selectedStore = STORES[0];
        
        // 검색 관련 변수
        let selectedSearchProduct = null;
        let searchQuantity = 1;
        let relatedQuantities = {}; // 관련 상품 수량 관리
        let purchasedQuantities = {}; // 내가 구매했던 상품 수량 관리
        
        // 검색창 포커스
        function onSearchFocus() {
            // 포커스 시 특별한 동작 없음
        }
        
        // 검색 입력
        function onSearchInput(query) {
            const dropdown = document.getElementById('autocomplete-dropdown');
            const list = document.getElementById('autocomplete-list');
            const clearBtn = document.getElementById('search-clear-btn');
            
            // 클리어 버튼 표시/숨김
            clearBtn.style.display = query.trim() ? 'flex' : 'none';
            
            if (!query.trim()) {
                dropdown.style.display = 'none';
                return;
            }
            
            // 모든 상품에서 검색
            let allProducts = [];
            Object.keys(PRODUCTS).forEach(category => {
                PRODUCTS[category].forEach(p => {
                    allProducts.push({...p, category});
                });
            });
            
            const results = allProducts.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 8); // 최대 8개까지만 표시
            
            if (results.length === 0) {
                list.innerHTML = '<div class="autocomplete-no-result">검색 결과가 없습니다</div>';
            } else {
                list.innerHTML = results.map(p => {
                    const isUrl = p.image && p.image.startsWith('http');
                    return `
                        <div class="autocomplete-item" onclick="goToSearchPage(${p.id}, '${p.category}')">
                            <div class="autocomplete-item-image">
                                ${isUrl ? `<img src="${p.image}" alt="${p.name}">` : '<span style="font-size:20px;">📦</span>'}
                            </div>
                            <div class="autocomplete-item-info">
                                <p class="autocomplete-item-name">${p.name}</p>
                                <p class="autocomplete-item-category">${p.category}</p>
                            </div>
                            <span class="autocomplete-item-price">${p.price.toLocaleString()}원</span>
                        </div>
                    `;
                }).join('');
            }
            
            dropdown.style.display = 'block';
        }
        
        // 검색 클리어
        function clearSearch() {
            document.getElementById('home-search-input').value = '';
            document.getElementById('autocomplete-dropdown').style.display = 'none';
            document.getElementById('search-clear-btn').style.display = 'none';
        }
        
        // 검색 페이지로 이동
        function goToSearchPage(productId, category) {
            const product = PRODUCTS[category].find(p => p.id === productId);
            if (!product) return;
            
            selectedSearchProduct = {...product, category};
            searchQuantity = 1;
            
            // 드롭다운 닫기
            document.getElementById('autocomplete-dropdown').style.display = 'none';
            document.getElementById('home-search-input').value = '';
            document.getElementById('search-clear-btn').style.display = 'none';
            
            // 검색 페이지로 이동
            navigateToSearch();
            renderSearchPage();
        }
        
        // 검색 페이지 네비게이션
        function navigateToSearch() {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-search').classList.add('active');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.getElementById('top-tabs').style.display = 'none';
            document.getElementById('back-btn').style.display = 'flex';
            window.scrollTo(0, 0);
        }
        
        // 검색 페이지 렌더링
        function renderSearchPage() {
            const container = document.getElementById('search-page-content');
            const p = selectedSearchProduct;
            
            if (!p) {
                container.innerHTML = `
                    <div class="search-hint" style="padding:60px 20px;text-align:center;">
                        <p>🔍 상품을 검색해주세요</p>
                    </div>
                `;
                return;
            }
            
            // 관련 상품 찾기 (같은 카테고리에서 현재 상품 제외)
            const relatedProducts = PRODUCTS[p.category]
                .filter(item => item.id !== p.id)
                .slice(0, 4);
            
            // 내가 구매했던 상품 찾기 (주문 내역에서 비슷한 상품)
            const productKeywords = p.name.split(/[\s\(\)\/]+/).filter(k => k.length >= 2);
            let purchasedProducts = [];
            
            // 주문 내역에서 비슷한 상품 찾기
            orderHistory.forEach(order => {
                order.items.forEach(item => {
                    // 키워드가 포함된 상품 찾기
                    const hasKeyword = productKeywords.some(keyword => 
                        item.name.toLowerCase().includes(keyword.toLowerCase())
                    );
                    if (hasKeyword && item.id !== p.id && !purchasedProducts.find(pp => pp.id === item.id)) {
                        purchasedProducts.push({
                            ...item,
                            orderDate: order.date
                        });
                    }
                });
            });
            
            // 같은 카테고리의 다른 상품도 추가 (최대 6개)
            if (purchasedProducts.length < 6) {
                const sameCategoryProducts = PRODUCTS[p.category]
                    .filter(item => item.id !== p.id && !purchasedProducts.find(pp => pp.id === item.id))
                    .slice(0, 6 - purchasedProducts.length);
                purchasedProducts = [...purchasedProducts, ...sameCategoryProducts];
            }
            
            purchasedProducts = purchasedProducts.slice(0, 6);
            
            const isUrl = p.image && p.image.startsWith('http');
            
            container.innerHTML = `
                <!-- 선택한 상품 -->
                <div class="selected-product-card">
                    <div class="selected-product-header">
                        <div class="selected-product-image">
                            ${isUrl ? `<img src="${p.image}" alt="${p.name}">` : '<span style="font-size:48px;">📦</span>'}
                        </div>
                        <div class="selected-product-info">
                            <p class="selected-product-category">${p.category}</p>
                            <p class="selected-product-name">${p.name}</p>
                            <div class="selected-product-price-row">
                                ${p.discount ? `<span class="selected-product-discount">${p.discount}%</span>` : ''}
                                <span class="selected-product-price">${p.price.toLocaleString()}원</span>
                                ${p.originalPrice > p.price ? `<span class="selected-product-original">${p.originalPrice.toLocaleString()}원</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="selected-product-actions">
                        <div class="selected-qty-control">
                            <button class="selected-qty-btn" onclick="changeSearchQty(-1)">−</button>
                            <span class="selected-qty-value" id="search-qty">${searchQuantity}</span>
                            <button class="selected-qty-btn" onclick="changeSearchQty(1)">+</button>
                        </div>
                        <button class="selected-add-cart-btn" onclick="addSearchProductToCart()">
                            ${(p.price * searchQuantity).toLocaleString()}원 담기
                        </button>
                    </div>
                </div>
                
                <!-- 내가 구매했던 상품 -->
                ${purchasedProducts.length > 0 ? `
                    <div class="my-purchased-section">
                        <h3 class="my-purchased-title">📋 내가 구매했던 상품</h3>
                        <div class="my-purchased-scroll swipe-container">
                            ${purchasedProducts.map(pp => {
                                const ppIsUrl = pp.image && pp.image.startsWith('http');
                                if (!purchasedQuantities[pp.id]) purchasedQuantities[pp.id] = 1;
                                return `
                                    <div class="my-purchased-card">
                                        <div class="my-purchased-image" onclick="goToSearchPage(${pp.id}, '${pp.category || p.category}')">
                                            ${ppIsUrl ? `<img src="${pp.image}" alt="${pp.name}">` : '<span style="font-size:32px;">📦</span>'}
                                        </div>
                                        <div class="my-purchased-info" onclick="goToSearchPage(${pp.id}, '${pp.category || p.category}')">
                                            <p class="my-purchased-name">${pp.name}</p>
                                            <p class="my-purchased-price">
                                                ${pp.discount ? `<span class="my-purchased-discount">${pp.discount}%</span>` : ''}
                                                ${pp.price.toLocaleString()}원
                                            </p>
                                        </div>
                                        <div class="my-purchased-actions">
                                            <div class="my-purchased-qty-control">
                                                <button class="my-purchased-qty-btn" onclick="changePurchasedQty(${pp.id}, -1)">−</button>
                                                <span class="my-purchased-qty-value" id="purchased-qty-${pp.id}">${purchasedQuantities[pp.id]}</span>
                                                <button class="my-purchased-qty-btn" onclick="changePurchasedQty(${pp.id}, 1)">+</button>
                                            </div>
                                            <button class="my-purchased-add-btn" onclick="addPurchasedToCart(${pp.id}, '${pp.category || p.category}')">담기</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- 관련 상품 -->
                ${relatedProducts.length > 0 ? `
                    <div class="related-products-section">
                        <h3 class="related-products-title">🛒 관련 상품</h3>
                        <div class="related-products-grid">
                            ${relatedProducts.map(rp => {
                                const rpIsUrl = rp.image && rp.image.startsWith('http');
                                // 관련 상품 수량 초기화
                                if (!relatedQuantities[rp.id]) relatedQuantities[rp.id] = 1;
                                const totalPrice = rp.price * (relatedQuantities[rp.id] || 1);
                                return `
                                    <div class="related-product-card" data-price="${rp.price}">
                                        <div class="related-product-image" onclick="goToSearchPage(${rp.id}, '${p.category}')">
                                            ${rpIsUrl ? `<img src="${rp.image}" alt="${rp.name}">` : '<span style="font-size:32px;">📦</span>'}
                                        </div>
                                        <div class="related-product-info" onclick="goToSearchPage(${rp.id}, '${p.category}')">
                                            <p class="related-product-name">${rp.name}</p>
                                            <p class="related-product-price">
                                                ${rp.discount ? `<span class="related-product-discount">${rp.discount}%</span>` : ''}
                                                ${rp.price.toLocaleString()}원
                                            </p>
                                        </div>
                                        <div class="related-product-total">
                                            총금액: <span id="related-total-${rp.id}">${totalPrice.toLocaleString()}</span>원
                                        </div>
                                        <div class="related-product-actions">
                                            <div class="related-qty-control">
                                                <button class="related-qty-btn" onclick="changeRelatedQty(${rp.id}, -1, ${rp.price})">−</button>
                                                <span class="related-qty-value" id="related-qty-${rp.id}">${relatedQuantities[rp.id] || 1}</span>
                                                <button class="related-qty-btn" onclick="changeRelatedQty(${rp.id}, 1, ${rp.price})">+</button>
                                            </div>
                                            <button class="related-add-btn" onclick="addRelatedToCart(${rp.id}, '${p.category}')">담기</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
            
            // 검색 페이지 검색창에 상품명 표시
            document.getElementById('search-page-input').value = p.name;
        }
        
        // 검색 페이지에서 검색
        function onSearchPageInput(query) {
            if (!query.trim()) {
                renderSearchPage();
                return;
            }
            
            // 모든 상품에서 검색
            let allProducts = [];
            Object.keys(PRODUCTS).forEach(category => {
                PRODUCTS[category].forEach(p => {
                    allProducts.push({...p, category});
                });
            });
            
            const results = allProducts.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase())
            );
            
            const container = document.getElementById('search-page-content');
            
            if (results.length === 0) {
                container.innerHTML = `
                    <div class="search-hint" style="padding:60px 20px;text-align:center;">
                        <p>😅 검색 결과가 없습니다</p>
                        <p class="search-hint-sub">다른 검색어로 시도해보세요</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div style="margin-bottom:12px;font-size:13px;color:var(--medium);">${results.length}개의 상품</div>
                <div class="related-products-section">
                    <div class="related-products-grid">
                        ${results.map(p => {
                            const isUrl = p.image && p.image.startsWith('http');
                            // 수량 초기화
                            if (!relatedQuantities[p.id]) relatedQuantities[p.id] = 1;
                            const totalPrice = p.price * (relatedQuantities[p.id] || 1);
                            return `
                                <div class="related-product-card" data-price="${p.price}">
                                    <div class="related-product-image" onclick="goToSearchPage(${p.id}, '${p.category}')">
                                        ${isUrl ? `<img src="${p.image}" alt="${p.name}">` : '<span style="font-size:32px;">📦</span>'}
                                    </div>
                                    <div class="related-product-info" onclick="goToSearchPage(${p.id}, '${p.category}')">
                                        <p class="related-product-name">${p.name}</p>
                                        <p class="related-product-price">
                                            ${p.discount ? `<span class="related-product-discount">${p.discount}%</span>` : ''}
                                            ${p.price.toLocaleString()}원
                                        </p>
                                    </div>
                                    <div class="related-product-total">
                                        총금액: <span id="related-total-${p.id}">${totalPrice.toLocaleString()}</span>원
                                    </div>
                                    <div class="related-product-actions">
                                        <div class="related-qty-control">
                                            <button class="related-qty-btn" onclick="changeRelatedQty(${p.id}, -1, ${p.price})">−</button>
                                            <span class="related-qty-value" id="related-qty-${p.id}">${relatedQuantities[p.id] || 1}</span>
                                            <button class="related-qty-btn" onclick="changeRelatedQty(${p.id}, 1, ${p.price})">+</button>
                                        </div>
                                        <button class="related-add-btn" onclick="addRelatedToCart(${p.id}, '${p.category}')">담기</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // 검색 수량 변경
        function changeSearchQty(delta) {
            searchQuantity = Math.max(1, searchQuantity + delta);
            document.getElementById('search-qty').textContent = searchQuantity;
            
            // 버튼 가격 업데이트
            const btn = document.querySelector('.selected-add-cart-btn');
            if (btn && selectedSearchProduct) {
                btn.textContent = `${(selectedSearchProduct.price * searchQuantity).toLocaleString()}원 담기`;
            }
        }
        
        // 검색 상품 장바구니 추가
        function addSearchProductToCart() {
            if (!selectedSearchProduct) return;
            
            const existing = cart.find(item => item.id === selectedSearchProduct.id);
            if (existing) {
                existing.quantity += searchQuantity;
            } else {
                cart.push({ ...selectedSearchProduct, quantity: searchQuantity, checked: true });
            }
            updateCartBadge();
            showToast(`${selectedSearchProduct.name} 장바구니에 추가됨`);
        }
        
        // 관련 상품 수량 변경
        function changeRelatedQty(productId, delta, price) {
            if (!relatedQuantities[productId]) relatedQuantities[productId] = 1;
            relatedQuantities[productId] = Math.max(1, relatedQuantities[productId] + delta);
            
            const qtyEl = document.getElementById(`related-qty-${productId}`);
            if (qtyEl) {
                qtyEl.textContent = relatedQuantities[productId];
            }
            
            // 총금액 업데이트
            const totalEl = document.getElementById(`related-total-${productId}`);
            if (totalEl && price) {
                const total = price * relatedQuantities[productId];
                totalEl.textContent = total.toLocaleString();
            }
        }
        
        // 관련 상품 장바구니 추가
        function addRelatedToCart(productId, category) {
            const product = PRODUCTS[category].find(p => p.id === productId);
            if (!product) return;
            
            const qty = relatedQuantities[productId] || 1;
            
            const existing = cart.find(item => item.id === productId);
            if (existing) {
                existing.quantity += qty;
            } else {
                cart.push({ ...product, category, quantity: qty, checked: true });
            }
            updateCartBadge();
            showToast(`${product.name} 장바구니에 추가됨`);
            
            // 수량 및 총금액 초기화
            relatedQuantities[productId] = 1;
            const qtyEl = document.getElementById(`related-qty-${productId}`);
            if (qtyEl) qtyEl.textContent = '1';
            const totalEl = document.getElementById(`related-total-${productId}`);
            if (totalEl) totalEl.textContent = product.price.toLocaleString();
        }
        
        // 내가 구매했던 상품 수량 변경
        function changePurchasedQty(productId, delta) {
            if (!purchasedQuantities[productId]) purchasedQuantities[productId] = 1;
            purchasedQuantities[productId] = Math.max(1, purchasedQuantities[productId] + delta);
            
            const qtyEl = document.getElementById(`purchased-qty-${productId}`);
            if (qtyEl) qtyEl.textContent = purchasedQuantities[productId];
        }
        
        // 내가 구매했던 상품 장바구니 추가
        function addPurchasedToCart(productId, category) {
            const product = PRODUCTS[category].find(p => p.id === productId);
            if (!product) return;
            
            const qty = purchasedQuantities[productId] || 1;
            
            const existing = cart.find(item => item.id === productId);
            if (existing) {
                existing.quantity += qty;
            } else {
                cart.push({ ...product, category, quantity: qty, checked: true });
            }
            updateCartBadge();
            showToast(`${product.name} 장바구니에 추가됨`);
            
            // 수량 초기화
            purchasedQuantities[productId] = 1;
            const qtyEl = document.getElementById(`purchased-qty-${productId}`);
            if (qtyEl) qtyEl.textContent = '1';
        }
        
        // 문서 클릭 시 드롭다운 닫기
        document.addEventListener('click', (e) => {
            const searchWrapper = document.querySelector('.search-box-wrapper');
            const dropdown = document.getElementById('autocomplete-dropdown');
            if (searchWrapper && dropdown && !searchWrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        function init() {
            renderTopTabs();
            renderProductSections();
            renderCoupons();
            renderHomeCoupons();
            initSwipeContainers();
            updateDeliveryBanner(); // 배송 배너 초기화
        }
        
        // 홈 화면 쿠폰 렌더링
        function renderHomeCoupons() {
            const container = document.getElementById('home-coupon-list');
            container.innerHTML = `
                <div class="promo-wrapper">
                    ${COUPONS.map(c => {
                        // 상품 쿠폰
                        if (c.type === 'product') {
                            return `
                                <div class="home-coupon-card product-type">
                                    <div class="home-coupon-top product">
                                        <span class="home-coupon-discount">${c.discountAmount.toLocaleString()}원</span>
                                        <span class="home-coupon-off">할인</span>
                                    </div>
                                    <div class="home-coupon-bottom">
                                        <p class="home-coupon-name">${c.productName}</p>
                                        <p class="home-coupon-expiry">${c.expiry}까지</p>
                                        <button class="home-coupon-btn ${myCoupons.find(m => m.id === c.id) ? 'downloaded' : ''}" 
                                                data-coupon-id="${c.id}"
                                                onclick="downloadCouponFromHome(${c.id})">
                                            ${myCoupons.find(m => m.id === c.id) ? '✓ 받음' : '<svg class="download-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg> 받기'}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }
                        // 일반 쿠폰
                        return `
                            <div class="home-coupon-card">
                                <div class="home-coupon-top">
                                    <span class="home-coupon-discount">${c.discount}</span>
                                    <span class="home-coupon-off">OFF</span>
                                </div>
                                <div class="home-coupon-bottom">
                                    <p class="home-coupon-name">${c.name}</p>
                                    <p class="home-coupon-expiry">${c.expiry}까지</p>
                                    <button class="home-coupon-btn ${myCoupons.find(m => m.id === c.id) ? 'downloaded' : ''}" 
                                            data-coupon-id="${c.id}"
                                            onclick="downloadCouponFromHome(${c.id})">
                                        ${myCoupons.find(m => m.id === c.id) ? '✓ 받음' : '<svg class="download-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg> 받기'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        // 홈에서 쿠폰 받기
        function downloadCouponFromHome(id) {
            const coupon = COUPONS.find(c => c.id === id);
            if (!coupon || myCoupons.find(m => m.id === id)) {
                if (myCoupons.find(m => m.id === id)) {
                    showToast('이미 받은 쿠폰입니다!');
                }
                return;
            }
            
            myCoupons.push({...coupon});
            
            // 버튼 상태 업데이트
            const btn = document.querySelector(`button[data-coupon-id="${id}"]`);
            if (btn) {
                btn.textContent = '✓ 받음';
                btn.classList.add('downloaded');
            }
            
            showToast('쿠폰이 발급되었습니다!');
            document.getElementById('my-coupon-count').textContent = myCoupons.length;
        }
        
        // 모든 쿠폰 받기
        function downloadAllCoupons() {
            let downloaded = 0;
            COUPONS.forEach(c => {
                if (!myCoupons.find(m => m.id === c.id)) {
                    myCoupons.push({...c});
                    downloaded++;
                }
            });
            
            if (downloaded > 0) {
                showToast(`${downloaded}개 쿠폰이 발급되었습니다!`);
                renderHomeCoupons();
                document.getElementById('my-coupon-count').textContent = myCoupons.length;
            } else {
                showToast('이미 모든 쿠폰을 받으셨습니다!');
            }
        }

        function renderTopTabs() {
            // TABS + 전단행사를 상단 탭에 표시
            const allTabs = [...TABS.slice(0, 4), '전단행사', ...TABS.slice(4)];
            document.getElementById('top-tabs-scroll').innerHTML = allTabs.map((tab, i) => 
                `<button class="top-tab ${i === 0 ? 'active' : ''}" onclick="scrollToSection('${tab}', this)">${tab}</button>`
            ).join('');
        }

        function renderProductSections() {
            let html = '';
            
            TABS.forEach(tab => {
                if (tab === '오늘만할인') {
                    html += renderSlideSection(tab, PRODUCTS[tab]);
                } else if (tab === '신상특가') {
                    html += renderGridSection(tab, PRODUCTS[tab]);
                } else if (tab === '과일') {
                    html += renderSwipeGridSection(tab, PRODUCTS[tab]);
                } else if (tab === '정육') {
                    html += renderTwoColumnSection(tab, PRODUCTS[tab]);
                } else {
                    html += renderListSection(tab, PRODUCTS[tab]);
                }
            });
            
            document.getElementById('product-sections').innerHTML = html;
            
            // 새로 추가된 스와이프 컨테이너 초기화
            setTimeout(() => initSwipeContainers(), 100);
        }

        function renderListSection(tab, products) {
            return `
                <div class="section" id="section-${tab}">
                    <div class="section-header" onclick="toggleSection('${tab}')">
                        <h3 class="section-title">${tab} <span class="section-toggle" id="toggle-${tab}"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></h3>
                    </div>
                    <div class="product-list section-content" id="content-${tab}">
                        ${(products || []).map(p => renderProductItem(p)).join('')}
                    </div>
                </div>
            `;
        }
        
        // 2열 그리드형 (정육)
        function renderTwoColumnSection(tab, products) {
            return `
                <div class="section two-column-section" id="section-${tab}">
                    <div class="section-header" onclick="toggleSection('${tab}')">
                        <h3 class="section-title">${tab} <span class="section-toggle" id="toggle-${tab}"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></h3>
                    </div>
                    <div class="section-content" id="content-${tab}">
                        <div class="two-column-grid">
                            ${(products || []).map(p => renderTwoColumnCard(p)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderTwoColumnCard(p) {
            const qty = quantities[p.id] || 1;
            const isUrl = p.image && p.image.startsWith('http');
            const hasVariants = p.variants && p.variants.length > 0;
            
            // 상품명에서 중량/원산지 분리
            const nameMatch = p.name.match(/^(.+?)\s+(\d+(?:G|KG|ML|EA|BOX|팩|손|통|입).*)$/i);
            let productName = p.name;
            let weightInfo = '';
            
            if (nameMatch) {
                productName = nameMatch[1];
                weightInfo = nameMatch[2];
            }
            
            return `
                <div class="two-column-card">
                    <div class="two-column-image" onclick="event.stopPropagation(); openProductDetail(${p.id})">
                        ${isUrl ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">` : `<span class="emoji">${p.image}</span>`}
                        ${p.badge ? `<span class="two-column-badge ${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
                        ${hasVariants ? `<span class="variant-badge">옵션</span>` : ''}
                    </div>
                    <p class="two-column-name" onclick="event.stopPropagation(); openProductDetail(${p.id})">${productName}</p>
                    ${weightInfo ? `<p class="two-column-weight">${weightInfo}</p>` : ''}
                    <div class="two-column-price-row">
                        ${p.discount ? `<span class="two-column-discount">${p.discount}%</span>` : ''}
                        <span class="two-column-price">${p.price.toLocaleString()}원</span>
                    </div>
                    ${p.originalPrice > p.price ? `<span class="two-column-original">${p.originalPrice.toLocaleString()}원</span>` : ''}
                    <div class="two-column-actions">
                        <div class="qty-control small">
                            <button class="qty-btn" onclick="event.stopPropagation(); changeQty(${p.id}, -1)">-</button>
                            <span class="qty-value" id="qty-${p.id}">${qty}</span>
                            <button class="qty-btn" onclick="event.stopPropagation(); changeQty(${p.id}, 1)">+</button>
                        </div>
                        <button class="add-cart-btn small" onclick="event.stopPropagation(); addToCart(${p.id})">담기</button>
                    </div>
                </div>
            `;
        }

        function renderProductItem(p) {
            const qty = quantities[p.id] || 1;
            const isUrl = p.image && p.image.startsWith('http');
            const hasVariants = p.variants && p.variants.length > 0;
            return `
                <div class="product-item">
                    <div class="product-image-wrap" onclick="event.stopPropagation(); openProductDetail(${p.id})">
                        ${isUrl ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">` : `<span class="emoji">${p.image}</span>`}
                        ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
                        ${hasVariants ? `<span class="variant-badge">옵션</span>` : ''}
                    </div>
                    <div class="product-info">
                        <p class="product-name" onclick="event.stopPropagation(); openProductDetail(${p.id})">${p.name}</p>
                        <div class="product-price-row">
                            ${p.discount ? `<span class="product-discount">${p.discount}%</span>` : ''}
                            <span class="product-price">${p.price.toLocaleString()}원</span>
                            ${p.originalPrice > p.price ? `<span class="product-original-price">${p.originalPrice.toLocaleString()}원</span>` : ''}
                        </div>
                        <div class="product-actions">
                            <div class="qty-control">
                                <button class="qty-btn" onclick="changeQty(${p.id}, -1)">-</button>
                                <span class="qty-value" id="qty-${p.id}">${qty}</span>
                                <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
                            </div>
                            <button class="add-cart-btn" onclick="addToCart(${p.id})">담기</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 슬라이드형 (오늘만할인) - 206x262
        function renderSlideSection(tab, products) {
            return `
                <div class="slide-section section" id="section-${tab}">
                    <div class="section-header" onclick="toggleSection('${tab}')">
                        <h3 class="section-title">${tab} <span class="section-toggle" id="toggle-${tab}"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></h3>
                    </div>
                    <div class="section-content" id="content-${tab}">
                        <div class="slide-scroll swipe-container">
                            <div class="slide-wrapper">
                                ${(products || []).map(p => {
                                    const qty = quantities[p.id] || 1;
                                    const isUrl = p.image && p.image.startsWith('http');
                                    const hasVariants = p.variants && p.variants.length > 0;
                                    return `
                                    <div class="slide-card" onclick="openProductDetail(${p.id})">
                                        <div class="slide-card-bg ${isUrl ? '' : (p.bg || 'bg-orange')}">
                                            ${isUrl ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">` : p.image}
                                        </div>
                                        ${p.badge ? `<span class="slide-card-badge ${p.badge}">${p.badge === 'hot' ? '🔥 HOT' : p.badge === 'new' ? '✨ NEW' : '🏆 BEST'}</span>` : ''}
                                        ${hasVariants ? `<span class="slide-variant-badge">옵션</span>` : ''}
                                        <div class="slide-card-content">
                                            <p class="slide-card-name">${p.name}</p>
                                            <div class="slide-card-price-row">
                                                <span class="slide-card-discount">${p.discount}%</span>
                                                <span class="slide-card-price">${p.price.toLocaleString()}원</span>
                                            </div>
                                            <span class="slide-card-original">${p.originalPrice.toLocaleString()}원</span>
                                            <div class="slide-card-actions">
                                                <div class="slide-qty-control">
                                                    <button class="slide-qty-btn" onclick="event.stopPropagation(); changeQty(${p.id}, -1)">−</button>
                                                    <span class="slide-qty-value" id="qty-${p.id}">${qty}</span>
                                                    <button class="slide-qty-btn" onclick="event.stopPropagation(); changeQty(${p.id}, 1)">+</button>
                                                </div>
                                                <button class="slide-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">
                                                    <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 가로 그리드형 (신상특가)
        function renderGridSection(tab, products) {
            const halfLength = Math.ceil((products || []).length / 2);
            const mdProducts = (products || []).slice(0, halfLength);
            const popularProducts = (products || []).slice(halfLength);
            
            return `
                <div class="grid-section section" id="section-${tab}">
                    <div class="section-header" onclick="toggleSection('${tab}')">
                        <h3 class="section-title">${tab} <span class="section-toggle" id="toggle-${tab}"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></h3>
                    </div>
                    <div class="section-content" id="content-${tab}">
                        <div class="grid-tabs">
                            <button class="grid-tab active" onclick="event.stopPropagation(); switchGridTab('${tab}', 'md', this)">MD</button>
                            <button class="grid-tab" onclick="event.stopPropagation(); switchGridTab('${tab}', 'popular', this)">인기</button>
                        </div>
                        <div class="grid-scroll swipe-container" id="grid-scroll-${tab}">
                            <div class="grid-wrapper" id="grid-md-${tab}">
                                ${mdProducts.map(p => renderGridCard(p)).join('')}
                            </div>
                            <div class="grid-wrapper" id="grid-popular-${tab}" style="display:none;">
                                ${popularProducts.map(p => renderGridCard(p)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // 단순 스와이프 그리드형 (과일) - 탭 없음
        function renderSwipeGridSection(tab, products) {
            return `
                <div class="grid-section section" id="section-${tab}">
                    <div class="section-header" onclick="toggleSection('${tab}')">
                        <h3 class="section-title">${tab} <span class="section-toggle" id="toggle-${tab}"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></h3>
                    </div>
                    <div class="section-content" id="content-${tab}">
                        <div class="grid-scroll swipe-container">
                            <div class="grid-wrapper">
                                ${(products || []).map(p => renderGridCard(p)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderGridCard(p) {
            const qty = quantities[p.id] || 1;
            const isUrl = p.image && p.image.startsWith('http');
            const hasVariants = p.variants && p.variants.length > 0;
            
            // 상품명에서 중량/원산지 분리
            const nameMatch = p.name.match(/^(.+?)\s+(\d+(?:G|KG|ML|EA|BOX|팩|손|통|입).*)$/i);
            let productName = p.name;
            let weightInfo = '';
            
            if (nameMatch) {
                productName = nameMatch[1];
                weightInfo = nameMatch[2];
            }
            
            // 배지 텍스트 결정
            let badgeText = '';
            if (p.badge === 'new') badgeText = 'NEW';
            else if (p.badge === 'best') badgeText = 'BEST';
            else if (p.badge === 'hot') badgeText = 'HOT';
            
            return `
                <div class="grid-card" data-product-id="${p.id}">
                    <div class="grid-card-image" onclick="event.stopPropagation(); openProductDetail(${p.id})">
                        ${isUrl ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : p.image}
                        ${p.badge ? `<span class="grid-card-badge ${p.badge}">${badgeText}</span>` : ''}
                        ${hasVariants ? `<span class="variant-badge">옵션</span>` : ''}
                    </div>
                    ${p.brand ? `<p class="grid-card-brand">${p.brand}</p>` : ''}
                    <p class="grid-card-name" onclick="event.stopPropagation(); openProductDetail(${p.id})">${productName}</p>
                    ${weightInfo ? `<p class="grid-card-weight">${weightInfo}</p>` : ''}
                    <div class="grid-card-price-row">
                        ${p.discount ? `<span class="grid-card-discount">${p.discount}%</span>` : ''}
                        <span class="grid-card-price">${p.price.toLocaleString()}원</span>
                    </div>
                    ${p.originalPrice > p.price ? `<span class="grid-card-original">${p.originalPrice.toLocaleString()}원</span>` : ''}
                    <div class="grid-card-actions">
                        <div class="qty-control small">
                            <button class="qty-btn" onclick="event.stopPropagation(); changeQty(${p.id}, -1)">-</button>
                            <span class="qty-value" id="qty-${p.id}">${qty}</span>
                            <button class="qty-btn" onclick="event.stopPropagation(); changeQty(${p.id}, 1)">+</button>
                        </div>
                        <button class="add-cart-btn small" onclick="event.stopPropagation(); addToCart(${p.id})">담기</button>
                    </div>
                </div>
            `;
        }
        
        function switchGridTab(tab, type, btn) {
            // 탭 버튼 active 상태 변경
            btn.parentElement.querySelectorAll('.grid-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            
            // 컨텐츠 전환
            const mdWrapper = document.getElementById(`grid-md-${tab}`);
            const popularWrapper = document.getElementById(`grid-popular-${tab}`);
            
            if (type === 'md') {
                mdWrapper.style.display = 'flex';
                popularWrapper.style.display = 'none';
            } else {
                mdWrapper.style.display = 'none';
                popularWrapper.style.display = 'flex';
            }
        }

        function changeQty(id, delta) {
            quantities[id] = Math.max(1, (quantities[id] || 1) + delta);
            const el = document.getElementById(`qty-${id}`);
            if (el) el.textContent = quantities[id];
        }

        function addToCart(id) {
            let product;
            for (const tab of TABS) {
                product = PRODUCTS[tab]?.find(p => p.id === id);
                if (product) break;
            }
            if (!product) return;

            const qty = quantities[id] || 1;
            const existing = cart.find(i => i.id === id);
            if (existing) existing.quantity += qty;
            else cart.push({ ...product, quantity: qty });

            quantities[id] = 1;
            renderProductSections();
            updateCartBadge();
            showToast(`${product.name} ${qty}개 담김!`);
        }

        function addToCartDirect(id) {
            let product;
            for (const tab of TABS) {
                product = PRODUCTS[tab]?.find(p => p.id === id);
                if (product) break;
            }
            if (!product) return;

            const existing = cart.find(i => i.id === id);
            if (existing) existing.quantity += 1;
            else cart.push({ ...product, quantity: 1 });

            updateCartBadge();
            showToast(`${product.name} 담김!`);
        }

        const MIN_DELIVERY_AMOUNT = 30000; // 배송 최소금액

        function updateCartBadge() {
            const count = cart.reduce((s, i) => s + (i.quantity || i.qty || 1), 0);
            const badge = document.getElementById('cart-badge');
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            
            // 배송 최소금액 배너 업데이트
            updateDeliveryBanner();
        }
        
        function updateDeliveryBanner() {
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.quantity || item.qty || 1)), 0);
            const banner = document.getElementById('delivery-banner');
            const bannerText = document.getElementById('delivery-banner-text');
            const bannerAmount = document.getElementById('delivery-banner-amount');
            const progressBar = document.getElementById('delivery-progress-bar');
            
            const remaining = MIN_DELIVERY_AMOUNT - totalAmount;
            const progress = Math.min(100, (totalAmount / MIN_DELIVERY_AMOUNT) * 100);
            
            // 프로그레스 바 업데이트
            progressBar.style.width = progress + '%';
            
            // 금액 표시
            bannerAmount.textContent = totalAmount.toLocaleString() + '원';
            
            if (remaining > 0) {
                // 최소금액 미달
                banner.classList.remove('complete');
                bannerText.innerHTML = `배송 최소금액까지 <strong>${remaining.toLocaleString()}원</strong> 남았어요!`;
            } else {
                // 최소금액 달성
                banner.classList.add('complete');
                bannerText.innerHTML = `<strong>배송 가능</strong>해요! 주문을 진행해주세요 🎉`;
            }
            
            // 홈 페이지이고 장바구니에 상품이 있을 때만 배너 표시
            const isHomePage = document.getElementById('page-home').classList.contains('active');
            if (cart.length === 0 || !isHomePage) {
                banner.style.display = 'none';
            } else {
                banner.style.display = 'block';
            }
        }

        function scrollToSection(tab, btn) {
            // 탭 활성화
            document.querySelectorAll('.top-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            
            // 현재 홈 페이지가 아니면 홈으로 먼저 이동
            const homePage = document.getElementById('page-home');
            const needsPageSwitch = !homePage.classList.contains('active');
            
            if (needsPageSwitch) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                homePage.classList.add('active');
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                document.querySelector('.nav-item').classList.add('active');
            }
            
            // 페이지 전환 후 스크롤 (전환 필요 시 딜레이)
            setTimeout(() => {
                const section = document.getElementById(`section-${tab}`);
                if (section) {
                    // 접혀있으면 펼치기
                    const content = document.getElementById(`content-${tab}`);
                    const toggle = document.getElementById(`toggle-${tab}`);
                    if (content && content.classList.contains('collapsed')) {
                        content.classList.remove('collapsed');
                        if (toggle) toggle.classList.remove('collapsed');
                    }
                    
                    const headerHeight = 110; // 헤더 + 탭 높이
                    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({ top: sectionTop, behavior: 'smooth' });
                }
            }, needsPageSwitch ? 50 : 0);
        }
        
        // 섹션 접기/펼치기
        function toggleSection(tab) {
            const content = document.getElementById(`content-${tab}`);
            const toggle = document.getElementById(`toggle-${tab}`);
            
            if (content) {
                content.classList.toggle('collapsed');
            }
            if (toggle) {
                toggle.classList.toggle('collapsed');
            }
        }
        
        // 쿠폰 섹션 접기/펼치기
        function toggleCouponSection() {
            toggleSection('coupon');
        }

        function navigateTo(page) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${page}`).classList.add('active');
            
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            event?.target?.closest('.nav-item')?.classList.add('active');
            
            document.getElementById('top-tabs').style.display = page === 'home' ? 'block' : 'none';
            document.getElementById('back-btn').style.display = page === 'home' ? 'none' : 'flex';
            
            // 배송 배너는 홈 페이지에서만 표시
            const deliveryBanner = document.getElementById('delivery-banner');
            if (page === 'home' && cart.length > 0) {
                deliveryBanner.style.display = 'block';
            } else {
                deliveryBanner.style.display = 'none';
            }
            
            if (page === 'cart') renderCart();
            if (page === 'coupon') renderCoupons();
            if (page === 'history') renderOrderHistory();
            if (page === 'notification') renderNotifications();
            window.scrollTo(0, 0);
        }

        function goHome() {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-home').classList.add('active');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelector('.nav-item').classList.add('active');
            document.getElementById('top-tabs').style.display = 'block';
            document.getElementById('back-btn').style.display = 'none';
            
            // 홈으로 돌아올 때 배송 배너 표시
            const deliveryBanner = document.getElementById('delivery-banner');
            if (cart.length > 0) {
                deliveryBanner.style.display = 'block';
            }
            
            window.scrollTo(0, 0);
        }

        function renderCart() {
            const container = document.getElementById('cart-content');
            if (cart.length === 0) {
                container.innerHTML = `
                    <h2 class="page-title">장바구니</h2>
                    <div class="empty-state" style="margin-top:20px;">
                        <div class="icon">🛒</div>
                        <p>장바구니가 비어있습니다</p>
                        <small>맛있는 상품을 담아보세요!</small>
                    </div>
                `;
                return;
            }
            
            // qty를 quantity로 통일
            cart.forEach(item => {
                if (item.qty !== undefined && item.quantity === undefined) {
                    item.quantity = item.qty;
                    delete item.qty;
                }
                if (item.quantity === undefined) item.quantity = 1;
            });
            
            const checkedItems = cart.filter(i => i.checked !== false);
            const total = checkedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            const allChecked = cart.every(i => i.checked !== false);
            
            container.innerHTML = `
                <h2 class="page-title">장바구니 (${cart.length})</h2>
                
                <div class="cart-select-all">
                    <label class="custom-checkbox">
                        <input type="checkbox" ${allChecked ? 'checked' : ''} onchange="toggleSelectAll(this.checked)">
                        <span class="checkmark"></span>
                    </label>
                    <label onclick="document.querySelector('.cart-select-all input').click()">전체선택</label>
                </div>
                
                ${cart.map(i => {
                    const isUrl = i.image && i.image.startsWith('http');
                    return `
                    <div class="cart-card">
                        <div class="cart-card-check">
                            <label class="custom-checkbox">
                                <input type="checkbox" ${i.checked !== false ? 'checked' : ''} onchange="toggleCartItem(${i.id}, this.checked)">
                                <span class="checkmark"></span>
                            </label>
                        </div>
                        <div class="cart-card-image">${isUrl ? `<img src="${i.image}" alt="${i.name}">` : i.image}</div>
                        <div class="cart-card-content">
                            <div class="cart-card-header">
                                <p class="cart-card-name">${i.name}</p>
                                <button class="cart-delete-btn" onclick="removeCartItem(${i.id})">✕</button>
                            </div>
                            <div class="cart-card-price-row">
                                <span class="cart-card-price">${i.price.toLocaleString()}원</span>
                                ${i.originalPrice > i.price ? `<span class="cart-card-original">${i.originalPrice.toLocaleString()}원</span>` : ''}
                            </div>
                            <div class="cart-card-qty">
                                <button onclick="updateCart(${i.id}, -1)">−</button>
                                <span>${i.quantity}</span>
                                <button onclick="updateCart(${i.id}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                `}).join('')}
                
                <div class="cart-summary">
                    <div class="cart-summary-row">
                        <span>상품금액</span>
                        <span>${total.toLocaleString()}원</span>
                    </div>
                    <div class="cart-summary-row">
                        <span>배송비</span>
                        <span>무료</span>
                    </div>
                    ${total > 0 && total < MIN_DELIVERY_AMOUNT ? `
                    <div class="cart-summary-row" style="color: var(--primary); font-size: 13px;">
                        <span>배송 최소금액까지</span>
                        <span style="font-weight: 700;">${(MIN_DELIVERY_AMOUNT - total).toLocaleString()}원 부족</span>
                    </div>
                    ` : ''}
                    <div class="cart-summary-row total">
                        <span>총 결제금액</span>
                        <span class="cart-total-price">${total.toLocaleString()}원</span>
                    </div>
                    <button class="order-btn" onclick="goToOrder()" ${checkedItems.length === 0 || total < MIN_DELIVERY_AMOUNT ? 'disabled' : ''}>
                        ${checkedItems.length === 0 ? '상품을 선택해주세요' : 
                          total < MIN_DELIVERY_AMOUNT ? `최소 ${MIN_DELIVERY_AMOUNT.toLocaleString()}원 이상 주문` : 
                          `${checkedItems.length}개 상품 주문하기`}
                    </button>
                </div>
            `;
        }
        
        function toggleSelectAll(checked) {
            cart.forEach(item => item.checked = checked);
            renderCart();
        }
        
        function toggleCartItem(id, checked) {
            const item = cart.find(i => i.id === id);
            if (item) item.checked = checked;
            renderCart();
        }
        
        function removeCartItem(id) {
            cart = cart.filter(i => i.id !== id);
            updateCartBadge();
            renderCart();
            showToast('상품이 삭제되었습니다.');
        }

        function updateCart(id, delta) {
            const item = cart.find(i => i.id === id);
            if (!item) return;
            item.quantity += delta;
            if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
            updateCartBadge();
            renderCart();
        }

        function goToOrder() {
            const checkedItems = cart.filter(i => i.checked !== false);
            if (checkedItems.length === 0) {
                showToast('주문할 상품을 선택해주세요.');
                return;
            }
            
            // 배송 최소금액 체크
            const totalAmount = checkedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            if (totalAmount < MIN_DELIVERY_AMOUNT) {
                const remaining = MIN_DELIVERY_AMOUNT - totalAmount;
                showToast(`배송 최소금액 ${MIN_DELIVERY_AMOUNT.toLocaleString()}원까지 ${remaining.toLocaleString()}원이 부족합니다.`);
                return;
            }
            
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-order').classList.add('active');
            document.getElementById('top-tabs').style.display = 'none';
            document.getElementById('back-btn').style.display = 'flex';
            renderOrder();
            window.scrollTo(0, 0);
        }

        function renderOrder() {
            const checkedItems = cart.filter(i => i.checked !== false);
            const total = checkedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            document.getElementById('order-content').innerHTML = `
                <h2 class="page-title">주문서 작성</h2>
                <div class="order-section">
                    <h3 class="order-section-title">주문자 정보</h3>
                    <div class="form-group">
                        <label class="form-label">주문자명 *</label>
                        <input class="form-input" id="order-name" placeholder="이름을 입력하세요">
                    </div>
                    <div class="form-group">
                        <label class="form-label">휴대폰 *</label>
                        <input class="form-input" id="order-phone" placeholder="010-0000-0000">
                    </div>
                    <div class="form-group">
                        <label class="form-label">주소 *</label>
                        <input class="form-input" id="order-address" placeholder="배송 주소를 입력하세요">
                    </div>
                    <div class="form-group">
                        <label class="form-label">요청사항</label>
                        <textarea class="form-textarea" id="order-request" placeholder="배송시 요청사항"></textarea>
                    </div>
                </div>
                <div class="order-section">
                    <h3 class="order-section-title">주문 상품 (${checkedItems.length}개)</h3>
                    ${checkedItems.map(i => {
                        const isUrl = i.image && i.image.startsWith('http');
                        return `
                        <div class="product-item" style="padding:12px 0;">
                            <div style="width:50px;height:50px;border-radius:8px;overflow:hidden;background:#f5f5f5;display:flex;align-items:center;justify-content:center;">
                                ${isUrl ? `<img src="${i.image}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="font-size:28px;">${i.image}</span>`}
                            </div>
                            <div class="product-info">
                                <p class="product-name">${i.name}</p>
                                <p style="font-size:12px;color:#999;">${i.price.toLocaleString()}원 × ${i.quantity}개</p>
                            </div>
                            <span style="font-weight:600;">${(i.price * i.quantity).toLocaleString()}원</span>
                        </div>
                    `}).join('')}
                </div>
                <div class="order-section">
                    <h3 class="order-section-title">결제 정보</h3>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;color:#666;">
                        <span>상품금액</span><span>${total.toLocaleString()}원</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;color:#666;">
                        <span>배송비</span><span>무료</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:16px 0 0;margin-top:8px;border-top:1px solid #eee;font-weight:700;">
                        <span>총 결제금액</span><span style="font-size:18px;color:#333333;">${total.toLocaleString()}원</span>
                    </div>
                </div>
                <div class="order-section">
                    <h3 class="order-section-title">결제 수단</h3>
                    <label class="payment-method">
                        <input type="radio" name="payment" value="만나서 카드결제" checked>
                        <span>💳 만나서 카드결제</span>
                    </label>
                    <label class="payment-method">
                        <input type="radio" name="payment" value="만나서 현금결제">
                        <span>💵 만나서 현금결제</span>
                    </label>
                </div>
                <button class="submit-order-btn" onclick="submitOrder()">주문 완료하기</button>
            `;
        }

        function submitOrder() {
            const name = document.getElementById('order-name').value;
            const phone = document.getElementById('order-phone').value;
            const address = document.getElementById('order-address').value;
            const request = document.getElementById('order-request')?.value || '';
            const payment = document.querySelector('input[name="payment"]:checked')?.value || '만나서 카드결제';
            
            if (!name || !phone || !address) {
                showToast('주문자 정보를 모두 입력해주세요.');
                return;
            }
            
            // 주문할 상품 (체크된 것만)
            const orderedItems = cart.filter(i => i.checked !== false);
            const totalPrice = orderedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            
            // 주문 내역 저장
            const order = {
                id: Date.now(),
                date: new Date().toLocaleString('ko-KR'),
                status: 'pending', // 'pending'(주문완료), 'shipping'(배송중), 'completed'(배송완료)
                name,
                phone,
                address,
                request,
                payment,
                items: [...orderedItems],
                totalPrice
            };
            orderHistory.unshift(order); // 최신 주문이 위로
            
            document.getElementById('order-content').innerHTML = `
                <div class="order-complete">
                    <div class="order-complete-icon">✅</div>
                    <h2 class="order-complete-title">주문이 완료되었습니다!</h2>
                    <p class="order-complete-text">주문해 주셔서 감사합니다.<br>빠른 시일 내에 배송해 드리겠습니다.</p>
                    <button class="home-btn" onclick="resetOrder()">홈으로 돌아가기</button>
                </div>
            `;
        }

        function resetOrder() {
            // 주문 완료된 (체크된) 상품만 제거
            cart = cart.filter(i => i.checked === false);
            updateCartBadge();
            goHome();
        }
        
        // 주문 내역 렌더링
        function renderOrderHistory() {
            const container = document.getElementById('history-content');
            
            if (orderHistory.length === 0) {
                container.innerHTML = `
                    <h2 class="page-title">주문내역</h2>
                    <div class="empty-state">
                        <div class="icon">📋</div>
                        <p>주문 내역이 없습니다</p>
                        <small>첫 주문을 해보세요!</small>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <h2 class="page-title">주문내역 (${orderHistory.length})</h2>
                <div class="order-history-list">
                    ${orderHistory.map(order => {
                        const statusText = {
                            'pending': '주문완료',
                            'shipping': '배송중',
                            'completed': '배송완료'
                        }[order.status] || '주문완료';
                        const statusClass = order.status || 'pending';
                        return `
                        <div class="order-history-card">
                            <div class="order-history-header">
                                <span class="order-date">${order.date}</span>
                                <span class="order-status ${statusClass}">${statusText}</span>
                            </div>
                            <div class="order-history-items">
                                ${order.items.slice(0, 2).map(item => {
                                    const isUrl = item.image && item.image.startsWith('http');
                                    return `
                                        <div class="order-history-item">
                                            <div class="order-item-image">
                                                ${isUrl ? `<img src="${item.image}" alt="${item.name}">` : '<span>📦</span>'}
                                            </div>
                                            <div class="order-item-info">
                                                <p class="order-item-name">${item.name}</p>
                                                <p class="order-item-qty">${item.quantity}개 · ${(item.price * item.quantity).toLocaleString()}원</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                                ${order.items.length > 2 ? `
                                    <div class="order-more-wrap">
                                        <span class="order-more-text">외 ${order.items.length - 2}개 상품</span>
                                        <button class="order-more-btn" onclick="toggleOrderItems(${order.id})">더보기</button>
                                    </div>
                                    <div class="order-hidden-items" id="order-items-${order.id}" style="display:none;">
                                        ${order.items.slice(2).map(item => {
                                            const isUrl = item.image && item.image.startsWith('http');
                                            return `
                                                <div class="order-history-item">
                                                    <div class="order-item-image">
                                                        ${isUrl ? `<img src="${item.image}" alt="${item.name}">` : '<span>📦</span>'}
                                                    </div>
                                                    <div class="order-item-info">
                                                        <p class="order-item-name">${item.name}</p>
                                                        <p class="order-item-qty">${item.quantity}개 · ${(item.price * item.quantity).toLocaleString()}원</p>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="order-history-footer">
                                <div class="order-total">
                                    <span>총 결제금액</span>
                                    <span class="order-total-price">${order.totalPrice.toLocaleString()}원</span>
                                </div>
                                <div class="order-payment">${order.payment}</div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            `;
        }
        
        // 주문 상태 변경 함수 (관리용)
        // status: 'pending'(주문완료), 'shipping'(배송중), 'completed'(배송완료)
        function updateOrderStatus(orderId, newStatus) {
            const order = orderHistory.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
                renderOrderHistory();
                showToast('주문 상태가 변경되었습니다.');
            }
        }
        
        // 주문 상품 더보기/접기
        function toggleOrderItems(orderId) {
            const hiddenItems = document.getElementById(`order-items-${orderId}`);
            const btn = event.target;
            
            if (hiddenItems.style.display === 'none') {
                hiddenItems.style.display = 'block';
                btn.textContent = '접기';
            } else {
                hiddenItems.style.display = 'none';
                btn.textContent = '더보기';
            }
        }

        function renderCoupons() {
            document.getElementById('my-coupon-count').textContent = myCoupons.length;
            
            // 탭 버튼 active 상태 업데이트
            const tabs = document.querySelectorAll('.coupon-tab');
            tabs.forEach((tab, idx) => {
                if ((currentCouponTab === 'available' && idx === 0) || (currentCouponTab === 'my' && idx === 1)) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            const list = document.getElementById('coupon-list');
            const data = currentCouponTab === 'available' ? COUPONS : myCoupons;
            
            if (data.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">🎫</div>
                        <p>쿠폰이 없습니다</p>
                        <small>${currentCouponTab === 'my' ? '쿠폰을 받아보세요!' : ''}</small>
                    </div>
                `;
                return;
            }

            list.innerHTML = data.map(c => {
                // 상품 할인 쿠폰
                if (c.type === 'product') {
                    const isUrl = c.image && c.image.startsWith('http');
                    return `
                        <div class="coupon-item product-coupon">
                            <div class="coupon-main">
                                <div class="coupon-product-image">
                                    ${isUrl ? `<img src="${c.image}" alt="${c.productName}" onerror="this.parentElement.innerHTML='🏷️'">` : (c.image || '🏷️')}
                                </div>
                                <div class="coupon-info">
                                    <p class="coupon-brand">${c.brand}</p>
                                    <p class="coupon-name">${c.productName}</p>
                                    <div class="coupon-product-discount">
                                        <span class="product-discount-amount">${c.discountAmount.toLocaleString()}원 할인</span>
                                    </div>
                                    <div class="coupon-meta">
                                        <span class="coupon-tag">${c.tag}</span>
                                        <span class="coupon-expiry">${c.expiry} 까지</span>
                                    </div>
                                </div>
                            </div>
                            ${currentCouponTab === 'available' ? `
                                <div class="coupon-action">
                                    <button class="coupon-download-btn" onclick="downloadCoupon(${c.id})">
                                        ${myCoupons.find(m => m.id === c.id) ? '✓ 받음' : '<svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg> 받기'}
                                    </button>
                                </div>
                            ` : `
                                <div class="coupon-action">
                                    <span style="color:#4CAF50;font-weight:600;">사용 가능</span>
                                </div>
                            `}
                        </div>
                    `;
                }
                
                // 일반 쿠폰 (% 할인, 원 할인)
                return `
                    <div class="coupon-item">
                        <div class="coupon-main">
                            <div class="coupon-discount-box">
                                <span class="coupon-discount-value">${c.discount}</span>
                                <span class="coupon-discount-off">OFF</span>
                            </div>
                            <div class="coupon-info">
                                <p class="coupon-brand">${c.brand}</p>
                                <p class="coupon-name">${c.name}</p>
                                <div class="coupon-price-row">
                                    <span class="coupon-sale-price">${c.salePrice?.toLocaleString() || ''}원</span>
                                    <span class="coupon-origin-price">${c.originPrice?.toLocaleString() || ''}원</span>
                                </div>
                                <div class="coupon-meta">
                                    <span class="coupon-tag">${c.tag}</span>
                                    <span class="coupon-expiry">${c.expiry} 까지</span>
                                </div>
                            </div>
                        </div>
                        ${currentCouponTab === 'available' ? `
                            <div class="coupon-action">
                                <button class="coupon-download-btn" onclick="downloadCoupon(${c.id})">
                                    ${myCoupons.find(m => m.id === c.id) ? '✓ 받음' : '<svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg> 받기'}
                                </button>
                            </div>
                        ` : `
                            <div class="coupon-action">
                                <span style="color:#4CAF50;font-weight:600;">사용 가능</span>
                            </div>
                        `}
                    </div>
                `;
            }).join('');
        }

        function switchCouponTab(tab, btn) {
            currentCouponTab = tab;
            document.querySelectorAll('.coupon-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            renderCoupons();
        }

        function downloadCoupon(id) {
            if (myCoupons.find(c => c.id === id)) {
                showToast('이미 받은 쿠폰입니다.');
                return;
            }
            const coupon = COUPONS.find(c => c.id === id);
            if (coupon) {
                myCoupons.push(coupon);
                renderCoupons();
                showToast('쿠폰이 발급되었습니다!');
            }
        }

        let currentScale = 1;
        let modalImg = null;

        function openModal(idx) {
            const imgSrc = idx === 1 ? 'flyer1.png' : 'flyer2.png';
            const fallbackEmoji = idx === 1 ? '📰' : '🥬';
            const fallbackText = idx === 1 ? '인기공산품 특가전' : '신선식품 일자별세일';
            
            currentScale = 1;
            
            document.getElementById('modal-body').innerHTML = `
                <img id="modal-img" src="${imgSrc}" alt="전단지" 
                    style="width:100%; max-height:100vh; object-fit:contain; transform:scale(1);"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display:none;flex-direction:column;align-items:center;justify-content:center;height:100vh;color:white;">
                    <span style="font-size:80px;">${fallbackEmoji}</span>
                    <p style="font-size:16px;margin-top:16px;">${fallbackText}</p>
                </div>
            `;
            
            document.getElementById('modal').classList.add('active');
            
            // 핀치 줌 설정
            setTimeout(() => {
                modalImg = document.getElementById('modal-img');
                if (modalImg) {
                    setupPinchZoom(modalImg);
                }
            }, 100);
        }

        function setupPinchZoom(img) {
            let initialDistance = 0;
            let initialScale = 1;
            
            img.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    initialDistance = getDistance(e.touches[0], e.touches[1]);
                    initialScale = currentScale;
                }
            }, { passive: true });
            
            img.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    const currentDistance = getDistance(e.touches[0], e.touches[1]);
                    const scale = (currentDistance / initialDistance) * initialScale;
                    currentScale = Math.min(Math.max(scale, 0.5), 4);
                    img.style.transform = `scale(${currentScale})`;
                }
            }, { passive: true });
            
            // 더블탭으로 확대/축소
            let lastTap = 0;
            img.addEventListener('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                    if (currentScale > 1) {
                        currentScale = 1;
                    } else {
                        currentScale = 2;
                    }
                    img.style.transform = `scale(${currentScale})`;
                }
                lastTap = currentTime;
            });
            
            // 마우스 휠로 확대/축소
            img.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.2 : 0.2;
                currentScale = Math.min(Math.max(currentScale + delta, 0.5), 4);
                img.style.transform = `scale(${currentScale})`;
            });
            
            // 클릭으로 확대/축소
            img.addEventListener('click', () => {
                if (currentScale > 1) {
                    currentScale = 1;
                } else {
                    currentScale = 2;
                }
                img.style.transform = `scale(${currentScale})`;
            });
        }
        
        function getDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function closeModal() {
            document.getElementById('modal').classList.remove('active');
            currentScale = 1;
        }

        // 상품 상세 팝업 관련 변수
        let currentDetailProduct = null;
        let detailQty = 1;
        let selectedVariants = {}; // { variantId: qty }

        // 상품 상세 팝업 열기
        function openProductDetail(productId, category) {
            // 모든 PRODUCTS에서 상품 찾기
            let product = null;
            for (const cat in PRODUCTS) {
                const found = PRODUCTS[cat].find(p => p.id === productId);
                if (found) {
                    product = { ...found, category: cat };
                    break;
                }
            }
            
            // CATEGORY_ALL_PRODUCTS에서도 찾기
            if (!product) {
                for (const cat in CATEGORY_ALL_PRODUCTS) {
                    const found = CATEGORY_ALL_PRODUCTS[cat].find(p => p.id === productId);
                    if (found) {
                        product = { ...found, category: cat };
                        break;
                    }
                }
            }
            
            if (!product) return;
            
            currentDetailProduct = product;
            detailQty = 1;
            selectedVariants = {};
            
            // 이미지 설정
            const imgContainer = document.getElementById('product-detail-image');
            imgContainer.innerHTML = `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">`;
            
            // 뱃지 설정
            const badge = document.getElementById('product-detail-badge');
            if (product.badge || product.eventType) {
                badge.textContent = product.badge === 'hot' ? 'HOT' : 
                                   product.badge === 'best' ? 'BEST' : 
                                   product.badge === 'new' ? 'NEW' : 
                                   product.eventType || '';
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
            
            // 본문 렌더링
            const body = document.getElementById('product-detail-body');
            const hasDiscount = product.discount && product.originalPrice;
            
            let bodyHTML = `
                <h3 class="product-detail-name">${product.name}</h3>
                <div class="product-detail-price-row">
                    ${hasDiscount ? `<span class="product-detail-discount">${product.discount}%</span>` : ''}
                    <span class="product-detail-price">${product.price.toLocaleString()}원</span>
                </div>
                ${hasDiscount ? `<p class="product-detail-original">${product.originalPrice.toLocaleString()}원</p>` : ''}
            `;
            
            // 묶음상품 옵션이 있는 경우
            if (product.variants && product.variants.length > 0) {
                bodyHTML += `
                    <div class="product-variants-section">
                        <p class="product-variants-title">📦 묶음상품 옵션</p>
                        <div class="product-variant-list">
                            ${product.variants.map((v, idx) => `
                                <div class="product-variant-item" data-variant-id="${v.id}" onclick="toggleVariant(${v.id}, ${v.price})">
                                    <div class="product-variant-checkbox">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12" fill="none"/></svg>
                                    </div>
                                    <div class="product-variant-info">
                                        <p class="product-variant-name">${v.name}</p>
                                        <p class="product-variant-price">${v.price.toLocaleString()}원</p>
                                    </div>
                                    <div class="product-variant-qty">
                                        <button class="qty-btn" onclick="event.stopPropagation(); changeVariantQty(${v.id}, -1, ${v.price})">−</button>
                                        <span class="qty-value" id="variant-qty-${v.id}">0</span>
                                        <button class="qty-btn" onclick="event.stopPropagation(); changeVariantQty(${v.id}, 1, ${v.price})">+</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="product-detail-add-btn" style="width: 100%; margin-top: 16px; margin-bottom: 10px;" onclick="addDetailToCart()">장바구니 담기</button>
                    </div>
                `;
                // 자동 선택 없음 - 사용자가 직접 선택
                
                // 묶음상품인 경우 일반 수량/장바구니 버튼 숨기기
                document.querySelector('.product-detail-footer').classList.add('hidden');
            } else {
                // 일반 상품인 경우 footer 표시
                document.querySelector('.product-detail-footer').classList.remove('hidden');
            }
            
            body.innerHTML = bodyHTML;
            
            // 수량 및 총액 초기화
            document.getElementById('detail-qty').textContent = detailQty;
            updateDetailTotal();
            
            // 팝업 표시
            document.getElementById('product-detail-modal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // 상품 상세 팝업 닫기
        function closeProductDetail() {
            document.getElementById('product-detail-modal').classList.remove('active');
            document.body.style.overflow = '';
            currentDetailProduct = null;
            selectedVariants = {};
        }

        // 묶음상품 토글
        function toggleVariant(variantId, price) {
            const item = document.querySelector(`.product-variant-item[data-variant-id="${variantId}"]`);
            const isSelected = item.classList.contains('selected');
            
            if (isSelected) {
                // 선택 해제
                item.classList.remove('selected');
                delete selectedVariants[variantId];
                document.getElementById(`variant-qty-${variantId}`).textContent = '0';
            } else {
                // 선택
                item.classList.add('selected');
                const variant = currentDetailProduct.variants.find(v => v.id === variantId);
                selectedVariants[variantId] = { qty: 1, price: price, name: variant.name };
                document.getElementById(`variant-qty-${variantId}`).textContent = '1';
            }
            
            updateDetailTotal();
        }

        // 묶음상품 수량 변경
        function changeVariantQty(variantId, delta, price) {
            const item = document.querySelector(`.product-variant-item[data-variant-id="${variantId}"]`);
            
            // 선택되지 않은 상태에서 + 버튼 누르면 선택하고 수량 1로
            if (!item.classList.contains('selected')) {
                if (delta > 0) {
                    item.classList.add('selected');
                    const variant = currentDetailProduct.variants.find(v => v.id === variantId);
                    selectedVariants[variantId] = { qty: 1, price: price, name: variant.name };
                    document.getElementById(`variant-qty-${variantId}`).textContent = '1';
                    updateDetailTotal();
                }
                return;
            }
            
            const current = selectedVariants[variantId]?.qty || 1;
            const newQty = Math.max(1, current + delta);
            selectedVariants[variantId].qty = newQty;
            document.getElementById(`variant-qty-${variantId}`).textContent = newQty;
            
            updateDetailTotal();
        }

        // 기본 수량 변경 (묶음상품 없는 경우)
        function changeDetailQty(delta) {
            detailQty = Math.max(1, detailQty + delta);
            document.getElementById('detail-qty').textContent = detailQty;
            updateDetailTotal();
        }

        // 총액 업데이트
        function updateDetailTotal() {
            let total = 0;
            
            if (currentDetailProduct.variants && Object.keys(selectedVariants).length > 0) {
                // 묶음상품 선택된 경우
                for (const vId in selectedVariants) {
                    total += selectedVariants[vId].price * selectedVariants[vId].qty;
                }
            } else {
                // 일반 상품
                total = currentDetailProduct.price * detailQty;
            }
            
            document.getElementById('product-detail-total').textContent = total.toLocaleString() + '원';
        }

        // 장바구니에 담기
        function addDetailToCart() {
            if (!currentDetailProduct) return;
            
            let addedItems = [];
            
            if (currentDetailProduct.variants && Object.keys(selectedVariants).length > 0) {
                // 묶음상품 선택된 경우
                for (const vId in selectedVariants) {
                    const variant = currentDetailProduct.variants.find(v => v.id == vId);
                    const variantData = selectedVariants[vId];
                    
                    const existing = cart.find(item => item.id == vId);
                    if (existing) {
                        existing.quantity += variantData.qty;
                    } else {
                        cart.push({
                            id: parseInt(vId),
                            name: `${currentDetailProduct.name.split(' ')[0]} ${variantData.name}`,
                            price: variantData.price,
                            originalPrice: variant.originalPrice || variantData.price,
                            image: currentDetailProduct.image,
                            quantity: variantData.qty,
                            category: currentDetailProduct.category,
                            checked: true
                        });
                    }
                    addedItems.push(`${variantData.name} ${variantData.qty}개`);
                }
            } else {
                // 일반 상품
                const existing = cart.find(item => item.id === currentDetailProduct.id);
                if (existing) {
                    existing.quantity += detailQty;
                } else {
                    cart.push({
                        id: currentDetailProduct.id,
                        name: currentDetailProduct.name,
                        price: currentDetailProduct.price,
                        originalPrice: currentDetailProduct.originalPrice || currentDetailProduct.price,
                        image: currentDetailProduct.image,
                        quantity: detailQty,
                        category: currentDetailProduct.category,
                        checked: true
                    });
                }
                addedItems.push(`${detailQty}개`);
            }
            
            updateCartBadge();
            closeProductDetail();
            showToast(`장바구니에 담았습니다! (${addedItems.join(', ')})`);
        }

        // 알림 렌더링
        function renderNotifications() {
            const container = document.getElementById('notification-list');
            
            if (notifications.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="margin-top:40px;">
                        <div class="icon">🔔</div>
                        <p>알림이 없습니다</p>
                        <small>새로운 소식이 오면 알려드릴게요!</small>
                    </div>
                `;
                return;
            }
            
            const iconSvgs = {
                order: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
                coupon: '<svg viewBox="0 0 24 24"><path d="M21 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="M7 12h10"/><circle cx="12" cy="12" r="3"/></svg>',
                event: '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
            };
            
            container.innerHTML = `
            ` + notifications.map(n => `
                <div class="notification-wrapper" data-id="${n.id}">
                    <div class="notification-actions notification-action-left">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div class="notification-actions notification-action-right">
                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </div>
                    <div class="notification-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                        <div class="notification-icon ${n.type}">
                            ${iconSvgs[n.type]}
                        </div>
                        <div class="notification-content">
                            <p class="notification-title">${n.title}</p>
                            <p class="notification-desc">${n.desc}</p>
                            <span class="notification-time">${n.time}</span>
                        </div>
                        ${n.unread ? '<span class="notification-dot"></span>' : ''}
                    </div>
                </div>
            `).join('');
            
            // 스와이프 이벤트 초기화
            initNotificationSwipe();
        }
        
        // 알림 스와이프 초기화
        function initNotificationSwipe() {
            const items = document.querySelectorAll('.notification-item');
            
            items.forEach(item => {
                let startX = 0;
                let currentX = 0;
                let isDragging = false;
                const threshold = 80;
                
                // 터치 이벤트
                item.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    isDragging = true;
                    item.classList.add('swiping');
                });
                
                item.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    currentX = e.touches[0].clientX;
                    const diff = currentX - startX;
                    
                    // 좌우 이동 제한
                    const translateX = Math.max(-100, Math.min(100, diff));
                    item.style.transform = `translateX(${translateX}px)`;
                });
                
                item.addEventListener('touchend', () => {
                    handleSwipeEnd(item, currentX - startX, threshold);
                });
                
                // 마우스 이벤트
                item.addEventListener('mousedown', (e) => {
                    startX = e.clientX;
                    isDragging = true;
                    item.classList.add('swiping');
                    e.preventDefault();
                });
                
                document.addEventListener('mousemove', (e) => {
                    if (!isDragging || !item.classList.contains('swiping')) return;
                    currentX = e.clientX;
                    const diff = currentX - startX;
                    
                    const translateX = Math.max(-100, Math.min(100, diff));
                    item.style.transform = `translateX(${translateX}px)`;
                });
                
                document.addEventListener('mouseup', () => {
                    if (!isDragging || !item.classList.contains('swiping')) return;
                    handleSwipeEnd(item, currentX - startX, threshold);
                });
            });
        }
        
        // 스와이프 종료 처리
        function handleSwipeEnd(item, diff, threshold) {
            item.classList.remove('swiping');
            const id = parseInt(item.dataset.id);
            
            if (diff < -threshold) {
                // 좌측 스와이프 → 삭제
                item.style.transform = 'translateX(-100%)';
                item.classList.add('removing');
                setTimeout(() => deleteNotification(id), 300);
            } else if (diff > threshold) {
                // 우측 스와이프 → 읽음 처리
                item.style.transform = 'translateX(0)';
                markNotificationAsRead(id);
            } else {
                // 원위치
                item.style.transform = 'translateX(0)';
            }
        }
        
        // 알림 읽음 처리
        function markNotificationAsRead(id) {
            const notification = notifications.find(n => n.id === id);
            if (notification && notification.unread) {
                notification.unread = false;
                renderNotifications();
                showToast('알림을 읽음 처리했습니다');
            }
        }
        
        // 알림 삭제
        function deleteNotification(id) {
            notifications = notifications.filter(n => n.id !== id);
            renderNotifications();
            showToast('알림을 삭제했습니다');
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }

        init();
